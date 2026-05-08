package world.yeon.backend.chat_service_chat_rooms.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ChatServiceChatMessageResponse(
	UUID id,
	UUID roomId,
	UUID senderId,
	String body,
	OffsetDateTime createdAt
) {}
