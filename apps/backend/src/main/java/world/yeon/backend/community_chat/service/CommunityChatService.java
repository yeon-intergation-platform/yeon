package world.yeon.backend.community_chat.service;

import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.community_chat.dto.*;
import world.yeon.backend.community_chat.repository.CommunityChatRepository;

@Service
public class CommunityChatService {
	private static final int MESSAGE_LIMIT = 100;
	private final CommunityChatRepository repository;

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
		String nickname = resolveNickname(senderUserId, request);
		var row = repository.insert(UUID.randomUUID(), senderUserId, guestSessionId, nickname, body);
		return new CommunityChatMessageMutationResponse(toResponse(row));
	}

	private CommunityChatMessageResponse toResponse(CommunityChatRepository.MessageRow row) {
		String senderId = row.senderUserId() != null ? "user:" + row.senderUserId() : "guest:" + row.guestSessionId();
		return new CommunityChatMessageResponse(row.id(), senderId, row.senderNickname(), row.body(), row.createdAt());
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
}
