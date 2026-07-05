package world.yeon.backend.users.dto;

public record InvalidateUserSessionsResponse(
	String userId,
	int invalidatedSessions
) {}
