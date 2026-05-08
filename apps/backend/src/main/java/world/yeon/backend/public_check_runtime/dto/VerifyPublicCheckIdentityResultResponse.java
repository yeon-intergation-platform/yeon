package world.yeon.backend.public_check_runtime.dto;

public record VerifyPublicCheckIdentityResultResponse(
	String verificationStatus,
	String message,
	String matchedMemberName
) {}
