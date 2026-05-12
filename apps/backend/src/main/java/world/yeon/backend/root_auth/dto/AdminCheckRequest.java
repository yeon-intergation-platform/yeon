package world.yeon.backend.root_auth.dto;

public record AdminCheckRequest(
	String userId,
	String email
) {}
