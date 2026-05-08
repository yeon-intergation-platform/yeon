package world.yeon.backend.activity_logs.dto;

import java.time.OffsetDateTime;
import java.util.Map;

public record ActivityLogResponse(
	String id,
	String memberId,
	String spaceId,
	String type,
	String status,
	OffsetDateTime recordedAt,
	String source,
	Map<String, Object> metadata,
	OffsetDateTime createdAt
) {}
