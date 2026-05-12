package world.yeon.backend.root_auth.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record AuthSessionUserResponse(
	String id,
	String email,
	String displayName,
	String avatarUrl,
	OffsetDateTime lastLoginAt,
	List<String> providers
) {}
