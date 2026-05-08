package world.yeon.backend.chat_service_blocks.dto;

public record ChatServiceProfileSummaryResponse(
	String id,
	String nickname,
	String ageLabel,
	String regionLabel,
	String avatarUrl,
	String bio,
	int points
) {}
