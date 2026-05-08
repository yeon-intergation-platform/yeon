package world.yeon.backend.chat_service_auth.dto;

import java.util.UUID;

public record ChatServiceSessionUserResponse(
	UUID id,
	String nickname,
	String ageLabel,
	String regionLabel,
	String avatarUrl,
	String bio,
	int points
) {}
