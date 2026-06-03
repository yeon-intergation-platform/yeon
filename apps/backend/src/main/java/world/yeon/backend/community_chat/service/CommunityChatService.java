package world.yeon.backend.community_chat.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.community_chat.dto.*;
import world.yeon.backend.community_chat.repository.CommunityChatRepository;

@Service
public class CommunityChatService {
	private static final int MESSAGE_LIMIT = 100;
	// IDX 97: community-chat 는 V7 마이그레이션상 공개(permitAll) 의도로 판단된다.
	// 인증 차단 대신 공개를 유지하되, 무인증 send 남용을 막기 위해 앱 레벨 인메모리 rate limit 으로 하드닝한다.
	// 입력 검증(normalize: 본문/닉네임/게스트세션 길이·필수)은 send() 에서 이미 수행한다.
	private static final long SEND_RATE_WINDOW_MILLIS = 10_000L;
	private static final int SEND_RATE_LIMIT_PER_WINDOW = 10;
	private final CommunityChatRepository repository;
	private final Map<String, List<Long>> sendRateBuckets = new ConcurrentHashMap<>();

	public CommunityChatService(CommunityChatRepository repository) {
		this.repository = repository;
	}

	@Transactional(readOnly = true)
	public CommunityChatMessagesResponse listMessages() {
		return new CommunityChatMessagesResponse(repository.listLatest(MESSAGE_LIMIT).stream().map(this::toResponse).toList());
	}

	@Transactional
	public CommunityChatMessageMutationResponse send(UUID senderUserId, SendCommunityChatMessageRequest request) {
		String body = normalize(request == null ? null : request.body(), "메시지", 1000);
		String guestSessionInput = request == null ? null : request.guestSessionId();
		String guestSessionId = senderUserId == null ? normalize(guestSessionInput, "게스트 세션", 128) : trimToNull(guestSessionInput);
		// IDX 97: 공개 유지 + send 남용 방어. 발신자(user 또는 게스트 세션) 단위로 전송 빈도를 제한한다.
		if (isSendRateLimited(senderUserId, guestSessionId)) {
			throw new CommunityChatServiceException(429, "COMMUNITY_CHAT_RATE_LIMITED", "메시지를 너무 자주 보냈습니다. 잠시 후 다시 시도해 주세요.");
		}
		String nickname = resolveNickname(senderUserId, request);
		var row = repository.insert(UUID.randomUUID(), senderUserId, guestSessionId, nickname, body);
		return new CommunityChatMessageMutationResponse(toResponse(row));
	}

	private CommunityChatMessageResponse toResponse(CommunityChatRepository.MessageRow row) {
		String senderId = row.senderUserId() != null ? "user:" + row.senderUserId() : "guest:" + anonymizeGuestSessionId(row.guestSessionId());
		return new CommunityChatMessageResponse(row.id(), senderId, row.senderNickname(), row.body(), row.createdAt());
	}

	private String anonymizeGuestSessionId(String guestSessionId) {
		if (guestSessionId == null || guestSessionId.isBlank()) return "anonymous";
		try {
			var digest = java.security.MessageDigest.getInstance("SHA-256").digest(guestSessionId.getBytes(java.nio.charset.StandardCharsets.UTF_8));
			var hex = new StringBuilder(24);
			for (int i = 0; i < 12; i++) hex.append(String.format("%02x", digest[i]));
			return hex.toString();
		} catch (java.security.NoSuchAlgorithmException error) {
			throw new IllegalStateException("게스트 식별자 익명화에 실패했습니다.", error);
		}
	}

	private String resolveNickname(UUID senderUserId, SendCommunityChatMessageRequest request) {
		String requested = trimToNull(request == null ? null : request.senderNickname());
		if (requested == null) requested = trimToNull(request == null ? null : request.guestNickname());
		if (requested != null) return normalize(requested, "닉네임", 40);
		return senderUserId == null ? "익명이" : "나";
	}

	private String normalize(String input, String label, int maxLength) {
		String normalized = trimToNull(input);
		if (normalized == null) {
			throw new CommunityChatServiceException(400, "COMMUNITY_CHAT_INVALID", label + "을 입력해 주세요.");
		}
		if (normalized.length() > maxLength) {
			throw new CommunityChatServiceException(400, "COMMUNITY_CHAT_INVALID", label + "은 " + maxLength + "자 이하로 입력해 주세요.");
		}
		return normalized;
	}

	private String trimToNull(String input) {
		if (input == null) return null;
		String normalized = input.trim();
		return normalized.isEmpty() ? null : normalized;
	}

	private boolean isSendRateLimited(UUID senderUserId, String guestSessionId) {
		// IDX 97: 슬라이딩 윈도우 토큰버킷. 식별자(user id 또는 게스트 세션) 단위 best-effort 인메모리 제한.
		String key = senderUserId != null ? "user:" + senderUserId : "guest:" + (guestSessionId == null ? "" : guestSessionId);
		long now = Instant.now().toEpochMilli();
		long since = now - SEND_RATE_WINDOW_MILLIS;
		AtomicBoolean limited = new AtomicBoolean(false);
		sendRateBuckets.compute(key, (bucketKey, values) -> {
			List<Long> recent = values == null ? new ArrayList<>() : new ArrayList<>(values.stream().filter(timestamp -> timestamp > since).toList());
			if (recent.size() >= SEND_RATE_LIMIT_PER_WINDOW) {
				limited.set(true);
				return recent;
			}
			recent.add(now);
			return recent;
		});
		return limited.get();
	}
}
