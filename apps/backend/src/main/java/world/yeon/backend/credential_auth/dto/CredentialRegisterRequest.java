package world.yeon.backend.credential_auth.dto;

public record CredentialRegisterRequest(
	String email,
	String password,
	String displayName,
	String ipAddress,
	String appOrigin
) {}
