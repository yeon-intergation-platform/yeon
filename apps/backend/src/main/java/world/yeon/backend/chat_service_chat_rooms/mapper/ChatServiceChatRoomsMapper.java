package world.yeon.backend.chat_service_chat_rooms.mapper;

import java.util.List;
import world.yeon.backend.chat_service_chat_rooms.dto.ChatServiceChatMessageMutationResponse;
import world.yeon.backend.chat_service_chat_rooms.dto.ChatServiceChatMessageResponse;
import world.yeon.backend.chat_service_chat_rooms.dto.ChatServiceChatRoomDetailResponse;
import world.yeon.backend.chat_service_chat_rooms.dto.ChatServiceChatRoomListResponse;
import world.yeon.backend.chat_service_chat_rooms.dto.ChatServiceChatRoomProfileSummaryResponse;
import world.yeon.backend.chat_service_chat_rooms.dto.ChatServiceChatRoomResponse;
import world.yeon.backend.chat_service_chat_rooms.repository.ChatServiceChatRoomsRepository;

public final class ChatServiceChatRoomsMapper {
	private ChatServiceChatRoomsMapper() {}

	public static ChatServiceChatRoomListResponse toListResponse(List<ChatServiceChatRoomsRepository.RoomSummaryRow> rows) {
		return new ChatServiceChatRoomListResponse(rows.stream().map(ChatServiceChatRoomsMapper::toRoomResponse).toList());
	}

	public static ChatServiceChatRoomDetailResponse toDetailResponse(
		ChatServiceChatRoomsRepository.RoomSummaryRow room,
		List<ChatServiceChatRoomsRepository.MessageRow> messages
	) {
		return new ChatServiceChatRoomDetailResponse(
			toRoomResponse(room),
			messages.stream().map(ChatServiceChatRoomsMapper::toMessageResponse).toList()
		);
	}

	public static ChatServiceChatMessageMutationResponse toMutationResponse(ChatServiceChatRoomsRepository.MessageRow row) {
		return new ChatServiceChatMessageMutationResponse(toMessageResponse(row));
	}

	private static ChatServiceChatRoomResponse toRoomResponse(ChatServiceChatRoomsRepository.RoomSummaryRow row) {
		return new ChatServiceChatRoomResponse(
			row.roomId(),
			new ChatServiceChatRoomProfileSummaryResponse(
				row.peerId(),
				row.peerNickname(),
				row.peerAgeLabel(),
				row.peerRegionLabel(),
				row.peerAvatarUrl(),
				row.peerBio(),
				row.peerPoints()
			),
			row.lastMessagePreview(),
			row.lastMessageAt(),
			0,
			row.unlockedByPayment()
		);
	}

	private static ChatServiceChatMessageResponse toMessageResponse(ChatServiceChatRoomsRepository.MessageRow row) {
		return new ChatServiceChatMessageResponse(row.id(), row.roomId(), row.senderId(), row.body(), row.createdAt());
	}
}
