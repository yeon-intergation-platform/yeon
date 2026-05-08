package world.yeon.backend.users.dto;

import java.time.OffsetDateTime;

public record UserResponse(
	String id,
	String email,
	String displayName,
	OffsetDateTime createdAt,
	OffsetDateTime updatedAt
) {}
