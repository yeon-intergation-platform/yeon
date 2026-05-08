package world.yeon.backend.chat_service_auth.service;

import java.security.MessageDigest;
import java.time.OffsetDateTime;
import java.util.HexFormat;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.chat_service_auth.dto.*;
import world.yeon.backend.chat_service_auth.repository.ChatServiceAuthRepository;

@Service
@Profile("jdbc")
public class ChatServiceAuthService {
	private static final long OTP_TTL_MS = 5 * 60 * 1000L;
	private static final long SESSION_TTL_MS = 30L * 24 * 60 * 60 * 1000;
	private final ChatServiceAuthRepository repository;

	public ChatServiceAuthService(ChatServiceAuthRepository repository) {
		this.repository = repository;
	}

	@Transactional
	public ChatServiceRequestOtpResponse requestOtp(String phoneNumberInput) {
		String phoneNumber = normalizePhone(phoneNumberInput);
		OffsetDateTime expiresAt = OffsetDateTime.now().plusSeconds(5 * 60);
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
		if (!isBypassEnabled() && !challenge.codeHash().equals(hash(code))) {
			throw new ChatServiceAuthServiceException(400, "CHAT_SERVICE_AUTH_CODE_INVALID", "인증번호가 올바르지 않습니다.");
		}
		repository.consumeChallenge(challenge.id());
		var profile = repository.findProfileByPhone(phoneNumber);
		if (profile == null) {
			profile = repository.createProfile(UUID.randomUUID(), phoneNumber, createNickname(phoneNumber));
		}
		String sessionToken = UUID.randomUUID().toString().replace("-","") + UUID.randomUUID().toString().replace("-","");
		OffsetDateTime expiresAt = OffsetDateTime.now().plusSeconds(30L * 24 * 60 * 60);
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

	private ChatServiceSessionUserResponse toUser(ChatServiceAuthRepository.ProfileRow profile) {
		return new ChatServiceSessionUserResponse(profile.id(), profile.nickname(), profile.ageLabel(), profile.regionLabel(), profile.avatarUrl(), profile.bio(), profile.points());
	}
	private String normalizePhone(String input) {
		String digits = input.replaceAll("\\D", "");
		if (digits.length() < 10 || digits.length() > 11) throw new ChatServiceAuthServiceException(400, "CHAT_SERVICE_PHONE_INVALID", "전화번호 형식이 올바르지 않습니다.");
		return digits;
	}
	private boolean isBypassEnabled() { return true; }
	private String createOtpCode() { return "123456"; }
	private String createNickname(String phoneNumber) { return "유저" + phoneNumber.substring(phoneNumber.length()-4); }
	private String hash(String value) {
		try {
			return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
		} catch (Exception e) { throw new RuntimeException(e); }
	}
}
