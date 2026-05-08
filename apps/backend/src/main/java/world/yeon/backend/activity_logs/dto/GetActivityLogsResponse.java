package world.yeon.backend.activity_logs.dto;

import java.util.List;

public record GetActivityLogsResponse(
	List<ActivityLogResponse> logs,
	int totalCount
) {}
