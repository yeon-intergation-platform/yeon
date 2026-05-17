package world.yeon.backend.users.dto;

import java.time.OffsetDateTime;

public record UserResponse(
	String id,
	String email,
	String displayName,
	String role,
	OffsetDateTime lastLoginAt,
	OffsetDateTime createdAt,
	OffsetDateTime updatedAt
) {}
