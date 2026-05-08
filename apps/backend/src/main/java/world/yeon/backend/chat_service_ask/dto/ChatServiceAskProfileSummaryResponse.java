package world.yeon.backend.chat_service_ask.dto;

import java.util.UUID;

public record ChatServiceAskProfileSummaryResponse(
	UUID id,
	String nickname,
	String ageLabel,
	String regionLabel,
	String avatarUrl,
	String bio,
	int points
) {}
