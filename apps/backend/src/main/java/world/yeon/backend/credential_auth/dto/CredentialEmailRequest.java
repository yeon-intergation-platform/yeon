package world.yeon.backend.credential_auth.dto;

public record CredentialEmailRequest(
	String email,
	String ipAddress,
	String appOrigin
) {}
