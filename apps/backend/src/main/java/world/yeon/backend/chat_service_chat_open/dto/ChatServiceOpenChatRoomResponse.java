package world.yeon.backend.chat_service_chat_open.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ChatServiceOpenChatRoomResponse(
	UUID id,
	ChatServiceOpenChatProfileSummaryResponse peer,
	String lastMessagePreview,
	OffsetDateTime lastMessageAt,
	int unreadCount,
	boolean unlockedByPayment
) {}
