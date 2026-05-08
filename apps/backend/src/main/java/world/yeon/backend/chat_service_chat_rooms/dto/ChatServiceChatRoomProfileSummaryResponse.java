package world.yeon.backend.chat_service_chat_rooms.dto;

import java.util.UUID;

public record ChatServiceChatRoomProfileSummaryResponse(
	UUID id,
	String nickname,
	String ageLabel,
	String regionLabel,
	String avatarUrl,
	String bio,
	int points
) {}
