package world.yeon.backend.chat_service_friends_overview.dto;

public record ChatServiceProfileSummaryResponse(
	String id,
	String nickname,
	String ageLabel,
	String regionLabel,
	String avatarUrl,
	String bio,
	int points
) {}
