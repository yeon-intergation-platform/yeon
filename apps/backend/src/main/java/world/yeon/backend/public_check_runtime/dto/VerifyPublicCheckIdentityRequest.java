package world.yeon.backend.public_check_runtime.dto;

public record VerifyPublicCheckIdentityRequest(
	String name,
	String phoneLast4
) {}
