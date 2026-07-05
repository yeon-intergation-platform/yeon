package world.yeon.backend.users.dto;

public record DeleteUserResponse(
	String userId,
	boolean deleted,
	int invalidatedSessions
) {}
