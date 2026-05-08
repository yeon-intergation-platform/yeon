package world.yeon.backend.chat_service_my_profile.dto;

import java.util.UUID;

public record ChatServiceMyProfileSummaryResponse(
	UUID id,
	String nickname,
	String ageLabel,
	String regionLabel,
	String avatarUrl,
	String bio,
	int points
) {}
