package world.yeon.backend.chat_service_chat_open.dto;

import java.util.UUID;

public record ChatServiceOpenChatProfileSummaryResponse(
	UUID id,
	String nickname,
	String ageLabel,
	String regionLabel,
	String avatarUrl,
	String bio,
	int points
) {}
