package world.yeon.backend.chat_service_my_profile.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ChatServiceMyReportResponse(
	UUID id,
	String targetType,
	String targetId,
	String reason,
	String status,
	OffsetDateTime createdAt
) {}
