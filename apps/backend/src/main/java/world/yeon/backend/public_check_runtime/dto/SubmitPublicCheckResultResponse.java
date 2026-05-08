package world.yeon.backend.public_check_runtime.dto;

public record SubmitPublicCheckResultResponse(
	String verificationStatus,
	String message,
	String matchedMemberName
) {}
