package world.yeon.backend.public_check_runtime.dto;

public record GetPublicCheckSessionResponse(
	String spaceId,
	PublicCheckSessionPublicResponse session,
	boolean shouldClearRememberedIdentity
) {}
