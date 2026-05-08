package world.yeon.backend.student_board_read.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record PublicCheckSessionSummaryResponse(
	String id,
	String title,
	String status,
	String checkMode,
	List<String> enabledMethods,
	String publicPath,
	OffsetDateTime opensAt,
	OffsetDateTime closesAt,
	String locationLabel,
	Integer radiusMeters,
	OffsetDateTime createdAt
) {}
