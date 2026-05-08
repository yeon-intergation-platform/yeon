package world.yeon.backend.chat_service_chat_rooms.service;

import static world.yeon.backend.chat_service_chat_rooms.mapper.ChatServiceChatRoomsMapper.toDetailResponse;
import static world.yeon.backend.chat_service_chat_rooms.mapper.ChatServiceChatRoomsMapper.toListResponse;
import static world.yeon.backend.chat_service_chat_rooms.mapper.ChatServiceChatRoomsMapper.toMutationResponse;

import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.chat_service_chat_rooms.dto.ChatServiceChatMessageMutationResponse;
import world.yeon.backend.chat_service_chat_rooms.dto.ChatServiceChatRoomDetailResponse;
import world.yeon.backend.chat_service_chat_rooms.dto.ChatServiceChatRoomListResponse;
import world.yeon.backend.chat_service_chat_rooms.repository.ChatServiceChatRoomsRepository;

@Service
@Profile("jdbc")
public class ChatServiceChatRoomsService {
	private final ChatServiceChatRoomsRepository repository;

	public ChatServiceChatRoomsService(ChatServiceChatRoomsRepository repository) {
		this.repository = repository;
	}

	@Transactional(readOnly = true)
	public ChatServiceChatRoomListResponse list(UUID currentProfileId) {
		return toListResponse(repository.listRoomSummaries(currentProfileId));
	}

	@Transactional(readOnly = true)
	public ChatServiceChatRoomDetailResponse get(UUID currentProfileId, UUID roomId) {
		var participant = repository.findRoomParticipant(roomId);
		if (participant == null) {
			throw new ChatServiceChatRoomsServiceException(404, "CHAT_SERVICE_ROOM_NOT_FOUND", "채팅방을 찾지 못했습니다.");
		}
		if (!participant.userAId().equals(currentProfileId) && !participant.userBId().equals(currentProfileId)) {
			throw new ChatServiceChatRoomsServiceException(403, "CHAT_SERVICE_ROOM_FORBIDDEN", "이 채팅방에 접근할 수 없습니다.");
		}
		UUID peerId = participant.userAId().equals(currentProfileId) ? participant.userBId() : participant.userAId();
		if (repository.hasBlockedRelation(currentProfileId, peerId)) {
			throw new ChatServiceChatRoomsServiceException(403, "CHAT_SERVICE_BLOCKED_RELATION", "차단 관계에서는 이 작업을 수행할 수 없습니다.");
		}
		var room = repository.findRoomSummary(roomId, currentProfileId);
		if (room == null) {
			throw new ChatServiceChatRoomsServiceException(404, "CHAT_SERVICE_ROOM_NOT_FOUND", "채팅방을 찾지 못했습니다.");
		}
		return toDetailResponse(room, repository.listMessages(roomId));
	}

	@Transactional
	public ChatServiceChatMessageMutationResponse send(UUID currentProfileId, UUID roomId, String body) {
		var participant = repository.findRoomParticipant(roomId);
		if (participant == null) {
			throw new ChatServiceChatRoomsServiceException(404, "CHAT_SERVICE_ROOM_NOT_FOUND", "채팅방을 찾지 못했습니다.");
		}
		if (!participant.userAId().equals(currentProfileId) && !participant.userBId().equals(currentProfileId)) {
			throw new ChatServiceChatRoomsServiceException(403, "CHAT_SERVICE_ROOM_MESSAGE_FORBIDDEN", "이 채팅방에 메시지를 보낼 수 없습니다.");
		}
		UUID peerId = participant.userAId().equals(currentProfileId) ? participant.userBId() : participant.userAId();
		if (repository.hasBlockedRelation(currentProfileId, peerId)) {
			throw new ChatServiceChatRoomsServiceException(403, "CHAT_SERVICE_BLOCKED_RELATION", "차단 관계에서는 메시지를 보낼 수 없습니다.");
		}
		var message = repository.insertMessage(UUID.randomUUID(), roomId, currentProfileId, body);
		repository.updateRoomLastMessageAt(roomId, message.createdAt());
		return toMutationResponse(message);
	}
}
