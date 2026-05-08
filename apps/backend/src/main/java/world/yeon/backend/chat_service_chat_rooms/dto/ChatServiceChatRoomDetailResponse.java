package world.yeon.backend.chat_service_chat_rooms.dto;

import java.util.List;

public record ChatServiceChatRoomDetailResponse(
	ChatServiceChatRoomResponse room,
	List<ChatServiceChatMessageResponse> messages
) {}
