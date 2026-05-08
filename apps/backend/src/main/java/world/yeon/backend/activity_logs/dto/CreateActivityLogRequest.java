package world.yeon.backend.activity_logs.dto;

public record CreateActivityLogRequest(
	String text,
	String authorLabel
) {}
