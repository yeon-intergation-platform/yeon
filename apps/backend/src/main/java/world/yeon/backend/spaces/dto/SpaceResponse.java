package world.yeon.backend.spaces.dto;

import java.time.OffsetDateTime;

public record SpaceResponse(
	String id,
	String name,
	String description,
	String startDate,
	String endDate,
	String createdByUserId,
	OffsetDateTime createdAt,
	OffsetDateTime updatedAt
) {}
