package world.yeon.backend.root_auth.dto;

import java.time.OffsetDateTime;

public record RootAuthSessionCreateResponse(
	String userId,
	String sessionToken,
	OffsetDateTime expiresAt
) {}
