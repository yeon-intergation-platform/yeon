package world.yeon.backend.credential_auth.dto;

public record CredentialRegisterResponse(
	boolean requiresLinkToExistingAccount,
	boolean verificationEmailSent
) {}
