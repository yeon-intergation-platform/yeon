package world.yeon.backend.user_profile.dto;

import java.util.UUID;

public record UserProfileResponse(
	UUID id,
	String email,
	String displayName,
	String avatarUrl
) {}
