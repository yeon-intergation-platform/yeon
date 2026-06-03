package world.yeon.backend.chat_service_auth.service;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.chat_service_auth.dto.*;
import world.yeon.backend.chat_service_auth.repository.ChatServiceAuthRepository;

@Service
public class ChatServiceAuthService {
	private static final long OTP_TTL_MS = 5 * 60 * 1000L;
	private static final long SESSION_TTL_MS = 30L * 24 * 60 * 60 * 1000;
	private static final String GUEST_PHONE_PREFIX = "guest:";
	private static final int GUEST_PHONE_KEY_LENGTH = 14;
	private static final long REQUEST_OTP_WINDOW_MILLIS = 60_000L;
	private static final int REQUEST_OTP_LIMIT_PER_WINDOW = 5;
	private static final int MAX_VERIFY_ATTEMPTS = 5;
	private final ChatServiceAuthRepository repository;
	private final boolean bypassEnabled;
	private final SecureRandom secureRandom = new SecureRandom();
	private final Map<String, List<Long>> requestOtpBuckets = new ConcurrentHashMap<>();
	private final Map<UUID, Integer> verifyAttempts = new ConcurrentHashMap<>();

	public ChatServiceAuthService(
		ChatServiceAuthRepository repository,
		@Value("${CHAT_SERVICE_OTP_BYPASS:false}") boolean bypassEnabled
	) {
		this.repository = repository;
		this.bypassEnabled = bypassEnabled;
	}

	@Transactional
	public ChatServiceRequestOtpResponse requestOtp(String phoneNumberInput) {
		String phoneNumber = normalizePhone(phoneNumberInput);
		if (isRequestOtpRateLimited(phoneNumber)) {
			throw new ChatServiceAuthServiceException(429, "CHAT_SERVICE_AUTH_RATE_LIMITED", "잠시 후 다시 시도해 주세요.");
		}
		OffsetDateTime expiresAt = OffsetDateTime.now(ZoneOffset.UTC).plusSeconds(5 * 60);
		String otpCode = createOtpCode();
		boolean acceptAnyCode = isBypassEnabled();
		var challenge = repository.insertChallenge(UUID.randomUUID(), phoneNumber, hash(otpCode), expiresAt);
		return new ChatServiceRequestOtpResponse(challenge.id(), challenge.expiresAt(), acceptAnyCode, null);
	}

	@Transactional
	public ChatServiceVerifyOtpResponse verifyOtp(UUID challengeId, String phoneNumberInput, String code) {
		String phoneNumber = normalizePhone(phoneNumberInput);
		var challenge = repository.findChallenge(challengeId);
		if (challenge == null || !challenge.phoneNumber().equals(phoneNumber)) {
			throw new ChatServiceAuthServiceException(404, "CHAT_SERVICE_AUTH_CHALLENGE_NOT_FOUND", "인증 요청을 찾을 수 없습니다.");
		}
		if (challenge.consumedAt() != null) {
			throw new ChatServiceAuthServiceException(409, "CHAT_SERVICE_AUTH_CHALLENGE_CONSUMED", "이미 사용된 인증 요청입니다.");
		}
		if (challenge.expiresAt().isBefore(OffsetDateTime.now())) {
			throw new ChatServiceAuthServiceException(410, "CHAT_SERVICE_AUTH_CHALLENGE_EXPIRED", "인증번호가 만료되었습니다.");
		}
		if (!isBypassEnabled()) {
			if (isVerifyLocked(challenge.id())) {
				throw new ChatServiceAuthServiceException(429, "CHAT_SERVICE_AUTH_CODE_ATTEMPTS_EXCEEDED", "인증 시도 횟수를 초과했습니다. 다시 요청해 주세요.");
			}
			if (!challenge.codeHash().equals(hash(code))) {
				if (registerFailedVerify(challenge.id())) {
					throw new ChatServiceAuthServiceException(429, "CHAT_SERVICE_AUTH_CODE_ATTEMPTS_EXCEEDED", "인증 시도 횟수를 초과했습니다. 다시 요청해 주세요.");
				}
				throw new ChatServiceAuthServiceException(400, "CHAT_SERVICE_AUTH_CODE_INVALID", "인증번호가 올바르지 않습니다.");
			}
		}
		verifyAttempts.remove(challenge.id());
		repository.consumeChallenge(challenge.id());
		var profile = repository.findProfileByPhone(phoneNumber);
		if (profile == null) {
			profile = repository.createProfile(UUID.randomUUID(), phoneNumber, createNickname(phoneNumber));
		}
		String sessionToken = UUID.randomUUID().toString().replace("-","") + UUID.randomUUID().toString().replace("-","");
		OffsetDateTime expiresAt = OffsetDateTime.now(ZoneOffset.UTC).plusSeconds(30L * 24 * 60 * 60);
		repository.insertSession(UUID.randomUUID(), profile.id(), hash(sessionToken), expiresAt);
		return new ChatServiceVerifyOtpResponse(new ChatServiceSessionResponse(sessionToken, expiresAt, toUser(profile)));
	}

	@Transactional(readOnly = true)
	public ChatServiceSessionStateResponse getSession(String sessionToken) {
		if (sessionToken == null || sessionToken.isBlank()) {
			return new ChatServiceSessionStateResponse(false, null);
		}
		var session = repository.findSessionByHash(hash(sessionToken));
		if (session == null) return new ChatServiceSessionStateResponse(false, null);
		if (session.expiresAt().isBefore(OffsetDateTime.now())) {
			repository.deleteSession(session.id());
			return new ChatServiceSessionStateResponse(false, null);
		}
		var profile = repository.findProfileById(session.profileId());
		if (profile == null) return new ChatServiceSessionStateResponse(false, null);
		repository.touchSession(session.id());
		return new ChatServiceSessionStateResponse(true, new ChatServiceSessionResponse(sessionToken, session.expiresAt(), toUser(profile)));
	}

	@Transactional
	public ChatServiceSessionStateResponse logout(String sessionToken) {
		if (sessionToken == null || sessionToken.isBlank()) {
			return new ChatServiceSessionStateResponse(false, null);
		}
		repository.deleteSessionByHash(hash(sessionToken));
		return new ChatServiceSessionStateResponse(false, null);
	}

	@Transactional
	public ChatServiceSessionUserResponse resolveGuestProfile(String guestNicknameInput, String guestPasswordInput) {
		String guestNickname = normalizeGuestValue(guestNicknameInput, "닉네임");
		String guestPassword = normalizeGuestValue(guestPasswordInput, "비밀번호");
		String phoneNumber = buildGuestPhoneNumber(guestNickname, guestPassword);
		var profile = repository.findProfileByPhone(phoneNumber);
		if (profile == null) {
			profile = repository.createGuestProfile(UUID.randomUUID(), phoneNumber, guestNickname);
		}
		return toUser(profile);
	}

	private ChatServiceSessionUserResponse toUser(ChatServiceAuthRepository.ProfileRow profile) {
		return new ChatServiceSessionUserResponse(profile.id(), profile.nickname(), profile.ageLabel(), profile.regionLabel(), profile.avatarUrl(), profile.bio(), profile.points());
	}
	private String normalizePhone(String input) {
		String digits = input.replaceAll("\\D", "");
		if (digits.length() < 10 || digits.length() > 11) throw new ChatServiceAuthServiceException(400, "CHAT_SERVICE_PHONE_INVALID", "전화번호 형식이 올바르지 않습니다.");
		return digits;
	}
	private boolean isBypassEnabled() { return bypassEnabled; }
	private String createOtpCode() {
		if (bypassEnabled) {
			return "123456";
		}
		return String.format("%06d", secureRandom.nextInt(1_000_000));
	}
	private boolean isRequestOtpRateLimited(String phoneNumber) {
		long now = Instant.now().toEpochMilli();
		long since = now - REQUEST_OTP_WINDOW_MILLIS;
		AtomicBoolean limited = new AtomicBoolean(false);
		requestOtpBuckets.compute(phoneNumber, (key, values) -> {
			List<Long> recent = values == null ? new ArrayList<>() : new ArrayList<>(values.stream().filter(timestamp -> timestamp > since).toList());
			if (recent.size() >= REQUEST_OTP_LIMIT_PER_WINDOW) {
				limited.set(true);
				return recent;
			}
			recent.add(now);
			return recent;
		});
		return limited.get();
	}
	private boolean isVerifyLocked(UUID challengeId) {
		return verifyAttempts.getOrDefault(challengeId, 0) >= MAX_VERIFY_ATTEMPTS;
	}
	private boolean registerFailedVerify(UUID challengeId) {
		int attempts = verifyAttempts.merge(challengeId, 1, Integer::sum);
		return attempts >= MAX_VERIFY_ATTEMPTS;
	}
	private String createNickname(String phoneNumber) { return "유저" + phoneNumber.substring(phoneNumber.length()-4); }
	private String normalizeGuestValue(String input, String label) {
		if (input == null) {
			throw new ChatServiceAuthServiceException(400, "CHAT_SERVICE_GUEST_INVALID", label + "을 입력해 주세요.");
		}
		String normalized = input.trim();
		if (normalized.isEmpty()) {
			throw new ChatServiceAuthServiceException(400, "CHAT_SERVICE_GUEST_INVALID", label + "을 입력해 주세요.");
		}
		return normalized;
	}
	private String buildGuestPhoneNumber(String guestNickname, String guestPassword) {
		String key = hash(guestNickname + "\u0000" + guestPassword).substring(0, GUEST_PHONE_KEY_LENGTH);
		return GUEST_PHONE_PREFIX + key;
	}
	private String hash(String value) {
		try {
			return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
		} catch (Exception e) { throw new RuntimeException(e); }
	}
}
