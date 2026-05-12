package world.yeon.backend.credential_auth.dto;

import java.time.OffsetDateTime;

public record CredentialLoginResponse(
	String userId,
	String sessionToken,
	OffsetDateTime expiresAt
) {}
