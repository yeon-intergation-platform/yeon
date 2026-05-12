package world.yeon.backend.credential_auth.dto;

public record CredentialResetConfirmRequest(
	String token,
	String newPassword
) {}
