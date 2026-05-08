package world.yeon.backend.public_check_sessions.dto;

public record UpdatePublicCheckSessionRequest(
	String status,
	String closesAt
) {}
