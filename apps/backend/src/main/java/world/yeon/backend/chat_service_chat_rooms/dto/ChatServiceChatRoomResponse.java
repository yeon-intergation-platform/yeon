package world.yeon.backend.chat_service_chat_rooms.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ChatServiceChatRoomResponse(
	UUID id,
	ChatServiceChatRoomProfileSummaryResponse peer,
	String lastMessagePreview,
	OffsetDateTime lastMessageAt,
	int unreadCount,
	boolean unlockedByPayment
) {}
