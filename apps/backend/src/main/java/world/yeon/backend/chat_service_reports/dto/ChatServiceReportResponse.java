package world.yeon.backend.chat_service_reports.dto;

public record ChatServiceReportResponse(
	String id,
	String targetType,
	String targetId,
	String reason,
	String status,
	String createdAt
) {}
