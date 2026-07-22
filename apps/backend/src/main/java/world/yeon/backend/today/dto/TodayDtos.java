package world.yeon.backend.today.dto;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public final class TodayDtos {
	private TodayDtos() {}

	public record Task(
		UUID id,
		String title,
		String priority,
		int estimatedMinutes,
		String categoryLabel,
		String status,
		String plannedDate,
		String completedAt,
		long version,
		String createdAt,
		String updatedAt
	) {}

	public record Summary(int totalCount, int completedCount, int completionRate, int estimatedMinutes) {}

	public record Recommendation(Task task, String reason, int score) {}

	public record BoardResponse(
		String date,
		List<Task> tasks,
		int inboxCount,
		Summary summary,
		Recommendation recommendation,
		String serverTime
	) {}

	public record CalendarDay(String date, int totalCount, int completedCount, int openCount) {}

	public record CalendarResponse(String month, List<CalendarDay> days) {}

	public record CreateTaskRequest(
		String title,
		String priority,
		Integer estimatedMinutes,
		String categoryLabel,
		String plannedDate
	) {}

	public record UpdateTaskRequest(
		Long version,
		String title,
		String priority,
		Integer estimatedMinutes,
		String categoryLabel,
		String plannedDate
	) {}

	public record TransitionTaskRequest(Long version) {}

	public record TaskResponse(Task task) {}

	public record ActivityType(
		UUID id,
		String name,
		String colorToken,
		String iconKey,
		int sortOrder,
		boolean active,
		long version
	) {}

	public record ActivityTypesResponse(List<ActivityType> activityTypes) {}

	public record CreateActivityTypeRequest(String name, String colorToken, String iconKey) {}

	public record UpdateActivityTypeRequest(
		Long version,
		String name,
		String colorToken,
		String iconKey,
		Integer sortOrder,
		Boolean active
	) {}

	public record ActivityTypeResponse(ActivityType activityType) {}

	public record RecordEntry(int entryIndex, ActivityType activityType, String note) {}

	public record RecordSlot(
		int hour,
		ActivityType activityType,
		String note,
		List<RecordEntry> entries
	) {}

	public record RecordSummary(int recordedHours, int recordRate, Map<String, Integer> activityMinutes) {}

	public record RecordResponse(String date, List<RecordSlot> slots, RecordSummary summary) {}

	public record UpsertRecordSlotRequest(UUID activityTypeId, String note, Integer entryIndex) {}
}
