package world.yeon.backend.chat_service_feed.dto;

import java.util.UUID;

public record ChatServiceFeedProfileSummaryResponse(
	UUID id,
	String nickname,
	String ageLabel,
	String regionLabel,
	String avatarUrl,
	String bio,
	int points
) {}
