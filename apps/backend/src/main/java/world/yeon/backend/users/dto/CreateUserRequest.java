package world.yeon.backend.users.dto;

public record CreateUserRequest(
	String email,
	String displayName
) {}
