package world.yeon.backend.public_check_runtime.dto;

public record VerifyPublicCheckIdentityResponse(
	String spaceId,
	VerifyPublicCheckIdentityResultResponse result,
	String rememberedMemberId
) {}
