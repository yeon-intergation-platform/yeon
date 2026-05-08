package world.yeon.backend.public_check_runtime.dto;

public record SubmitPublicCheckResponse(
	String spaceId,
	SubmitPublicCheckResultResponse result,
	String rememberedMemberId,
	boolean shouldClearRememberedIdentity
) {}
