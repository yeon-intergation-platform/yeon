package world.yeon.backend.members.dto;

import java.time.OffsetDateTime;

public record MemberResponse(
	String id,
	String spaceId,
	String name,
	String email,
	String phone,
	String status,
	String initialRiskLevel,
	OffsetDateTime createdAt,
	OffsetDateTime updatedAt
) {}
