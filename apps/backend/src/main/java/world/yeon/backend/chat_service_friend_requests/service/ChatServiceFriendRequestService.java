package world.yeon.backend.chat_service_friend_requests.service;

import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.chat_service_friend_requests.dto.ChatServiceFriendMutationResponse;
import world.yeon.backend.chat_service_friend_requests.repository.ChatServiceFriendRequestRepository;

@Service
public class ChatServiceFriendRequestService {
	private final ChatServiceFriendRequestRepository repository;

	public ChatServiceFriendRequestService(ChatServiceFriendRequestRepository repository) {
		this.repository = repository;
	}

	@Transactional
	public ChatServiceFriendMutationResponse send(UUID currentProfileId, UUID targetProfileId) {
		if (currentProfileId.equals(targetProfileId)) {
			throw new ChatServiceFriendRequestServiceException(400, "CHAT_SERVICE_SELF_INTERACTION", "자기 자신과는 상호작용할 수 없습니다.");
		}
		if (repository.hasBlockedRelation(currentProfileId, targetProfileId)) {
			throw new ChatServiceFriendRequestServiceException(403, "CHAT_SERVICE_BLOCKED_RELATION", "차단 관계에서는 이 작업을 수행할 수 없습니다.");
		}
		if (!repository.existsProfile(targetProfileId)) {
			throw new ChatServiceFriendRequestServiceException(404, "CHAT_SERVICE_FRIEND_TARGET_NOT_FOUND", "친구 요청 대상 프로필을 찾지 못했습니다.");
		}
		var existingLink = repository.findLinkBetween(currentProfileId, targetProfileId);
		if (existingLink == null) {
			repository.insertPendingLink(UUID.randomUUID(), currentProfileId, targetProfileId);
			return new ChatServiceFriendMutationResponse(true);
		}
		if ("accepted".equals(existingLink.status())) {
			return new ChatServiceFriendMutationResponse(true);
		}
		if (existingLink.requesterId().equals(targetProfileId)) {
			repository.acceptLink(existingLink.id());
		}
		return new ChatServiceFriendMutationResponse(true);
	}
}
