package world.yeon.backend.chat_service_chat_open.service;

import static world.yeon.backend.chat_service_chat_open.mapper.ChatServiceChatOpenMapper.toResponse;

import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.chat_service_chat_open.dto.ChatServiceOpenChatResponse;
import world.yeon.backend.chat_service_chat_open.repository.ChatServiceChatOpenRepository;

@Service
@Profile("jdbc")
public class ChatServiceChatOpenService {
	private static final int DM_UNLOCK_AMOUNT = 100;
	private final ChatServiceChatOpenRepository repository;

	public ChatServiceChatOpenService(ChatServiceChatOpenRepository repository) {
		this.repository = repository;
	}

	@Transactional
	public ChatServiceOpenChatResponse open(UUID currentProfileId, UUID targetProfileId) {
		if (currentProfileId.equals(targetProfileId)) {
			throw new ChatServiceChatOpenServiceException(400, "CHAT_SERVICE_SELF_INTERACTION", "자기 자신과는 상호작용할 수 없습니다.");
		}
		if (repository.hasBlockedRelation(currentProfileId, targetProfileId)) {
			throw new ChatServiceChatOpenServiceException(403, "CHAT_SERVICE_BLOCKED_RELATION", "차단 관계에서는 이 작업을 수행할 수 없습니다.");
		}
		if (!repository.existsProfile(currentProfileId) || !repository.existsProfile(targetProfileId)) {
			throw new ChatServiceChatOpenServiceException(404, "CHAT_SERVICE_ROOM_TARGET_NOT_FOUND", "채팅 상대 프로필을 찾지 못했습니다.");
		}

		String roomKey = createRoomKey(currentProfileId, targetProfileId);
		var existing = repository.findRoomSummaryByRoomKey(roomKey, currentProfileId);
		if (existing != null) {
			return toResponse(existing);
		}

		boolean acceptedFriendLink = repository.hasAcceptedFriendLink(currentProfileId, targetProfileId);
		UUID insertedRoomId = repository.insertRoom(
			UUID.randomUUID(),
			roomKey,
			currentProfileId,
			targetProfileId,
			!acceptedFriendLink
		);
		if (insertedRoomId != null && !acceptedFriendLink) {
			if (!repository.deductPoints(currentProfileId, DM_UNLOCK_AMOUNT)) {
				throw new ChatServiceChatOpenServiceException(400, "CHAT_SERVICE_NOT_ENOUGH_POINTS", "포인트가 부족합니다.");
			}
			repository.insertDmUnlock(UUID.randomUUID(), insertedRoomId, currentProfileId, targetProfileId, DM_UNLOCK_AMOUNT);
		}

		var room = repository.findRoomSummaryByRoomKey(roomKey, currentProfileId);
		if (room == null) {
			throw new ChatServiceChatOpenServiceException(500, "CHAT_SERVICE_ROOM_OPEN_FAILED", "대화방을 생성하지 못했습니다.");
		}
		return toResponse(room);
	}

	private String createRoomKey(UUID currentProfileId, UUID targetProfileId) {
		String a = currentProfileId.toString();
		String b = targetProfileId.toString();
		return a.compareTo(b) <= 0 ? a + ":" + b : b + ":" + a;
	}
}
