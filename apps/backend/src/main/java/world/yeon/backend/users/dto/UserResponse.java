package world.yeon.backend.users.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record UserResponse(
	String id,
	String email,
	String displayName,
	String role,
	OffsetDateTime lastLoginAt,
	OffsetDateTime createdAt,
	OffsetDateTime updatedAt,
	OffsetDateTime emailVerifiedAt,
	int sessionCount,
	List<String> identityProviders,
	int cardDeckCount,
	int typingDeckCount
) {}
