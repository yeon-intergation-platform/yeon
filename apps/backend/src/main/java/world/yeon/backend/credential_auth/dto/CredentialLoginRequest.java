package world.yeon.backend.credential_auth.dto;

public record CredentialLoginRequest(
	String email,
	String password,
	String ipAddress
) {}
