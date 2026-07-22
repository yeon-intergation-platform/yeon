package world.yeon.backend.today.service;

import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.today.dto.TodayDtos;
import world.yeon.backend.today.repository.TodayRepository;

@Service
@Transactional
public class TodayService {
	private static final String PRIORITY_HIGH = "high";
	private static final String PRIORITY_NORMAL = "normal";
	private static final String PRIORITY_LOW = "low";
	private static final String STATUS_INBOX = "inbox";
	private static final String STATUS_PLANNED = "planned";
	private static final String STATUS_DONE = "done";
	private static final Set<String> PRIORITIES = Set.of(PRIORITY_HIGH, PRIORITY_NORMAL, PRIORITY_LOW);
	private static final Set<String> ACTIVITY_COLORS = Set.of("blue", "green", "orange", "purple", "yellow", "red", "gray");
	private static final Set<String> ACTIVITY_ICONS = Set.of("book", "gamepad", "utensils", "car", "coffee", "moon", "dumbbell", "circle");
	private static final List<TodayRepository.ActivitySeed> DEFAULT_ACTIVITY_TYPES = List.of(
		new TodayRepository.ActivitySeed("공부", "blue", "book", 0),
		new TodayRepository.ActivitySeed("게임", "purple", "gamepad", 10),
		new TodayRepository.ActivitySeed("식사", "orange", "utensils", 20),
		new TodayRepository.ActivitySeed("이동", "green", "car", 30),
		new TodayRepository.ActivitySeed("휴식", "yellow", "coffee", 40),
		new TodayRepository.ActivitySeed("수면", "purple", "moon", 50),
		new TodayRepository.ActivitySeed("운동", "red", "dumbbell", 60),
		new TodayRepository.ActivitySeed("기타", "gray", "circle", 70)
	);

	private final TodayRepository repository;

	public TodayService(TodayRepository repository) {
		this.repository = repository;
	}

	public TodayDtos.BoardResponse getBoard(UUID ownerUserId, String rawDate) {
		UUID owner = requireOwner(ownerUserId);
		LocalDate date = parseDate(rawDate);
		List<TodayRepository.TaskRow> rows = repository.listBoardTasks(owner, date);
		List<TodayRepository.TaskRow> datedRows = rows.stream()
			.filter(row -> !STATUS_INBOX.equals(row.status()))
			.toList();
		int totalCount = datedRows.size();
		int completedCount = (int) datedRows.stream().filter(row -> STATUS_DONE.equals(row.status())).count();
		int estimatedMinutes = datedRows.stream().mapToInt(TodayRepository.TaskRow::estimatedMinutes).sum();
		int completionRate = totalCount == 0 ? 0 : (int) Math.round(completedCount * 100.0 / totalCount);
		return new TodayDtos.BoardResponse(
			date.toString(),
			rows.stream().map(this::toTask).toList(),
			(int) rows.stream().filter(row -> STATUS_INBOX.equals(row.status())).count(),
			new TodayDtos.Summary(totalCount, completedCount, completionRate, estimatedMinutes),
			buildRecommendation(datedRows),
			now().toInstant().toString()
		);
	}

	public TodayDtos.CalendarResponse getCalendar(UUID ownerUserId, String rawMonth) {
		UUID owner = requireOwner(ownerUserId);
		YearMonth month = parseMonth(rawMonth);
		List<TodayDtos.CalendarDay> days = repository.listCalendar(
			owner,
			month.atDay(1),
			month.atEndOfMonth()
		).stream().map(row -> new TodayDtos.CalendarDay(
			row.date().toString(),
			row.totalCount(),
			row.completedCount(),
			row.totalCount() - row.completedCount()
		)).toList();
		return new TodayDtos.CalendarResponse(month.toString(), days);
	}

	public TodayDtos.TaskResponse createTask(UUID ownerUserId, TodayDtos.CreateTaskRequest request) {
		UUID owner = requireOwner(ownerUserId);
		if (request == null) {
			throw badRequest("할 일 내용을 입력해주세요.");
		}
		String title = normalizeRequired(request.title(), 200, "할 일 내용을 입력해주세요.");
		String priority = validatePriority(request.priority() == null ? PRIORITY_NORMAL : request.priority());
		int estimatedMinutes = validateEstimatedMinutes(request.estimatedMinutes() == null ? 30 : request.estimatedMinutes());
		String categoryLabel = normalizeOptional(request.categoryLabel(), 40, "카테고리는 40자 이하로 입력해주세요.");
		LocalDate plannedDate = parseOptionalDate(request.plannedDate());
		String status = plannedDate == null ? STATUS_INBOX : STATUS_PLANNED;
		return new TodayDtos.TaskResponse(toTask(repository.insertTask(
			owner,
			title,
			priority,
			estimatedMinutes,
			categoryLabel,
			status,
			plannedDate,
			now()
		)));
	}

	public TodayDtos.TaskResponse updateTask(UUID ownerUserId, UUID taskId, TodayDtos.UpdateTaskRequest request) {
		UUID owner = requireOwner(ownerUserId);
		TodayRepository.TaskRow current = requireTask(owner, taskId);
		long version = requireVersion(request == null ? null : request.version());
		assertVersion(current.version(), version);
		String title = normalizeRequired(request.title(), 200, "할 일 내용을 입력해주세요.");
		String priority = validatePriority(request.priority());
		int estimatedMinutes = validateEstimatedMinutes(request.estimatedMinutes());
		String categoryLabel = normalizeOptional(request.categoryLabel(), 40, "카테고리는 40자 이하로 입력해주세요.");
		LocalDate plannedDate = parseOptionalDate(request.plannedDate());
		String status = resolveEditedTaskStatus(current.status(), plannedDate);
		OffsetDateTime completedAt = STATUS_DONE.equals(status) ? current.completedAt() : null;
		boolean updated = repository.updateTask(
			owner,
			taskId,
			version,
			title,
			priority,
			estimatedMinutes,
			categoryLabel,
			status,
			plannedDate,
			completedAt,
			now()
		);
		if (!updated) {
			throw conflict();
		}
		return new TodayDtos.TaskResponse(toTask(requireTask(owner, taskId)));
	}

	public TodayDtos.TaskResponse completeTask(UUID ownerUserId, UUID taskId, TodayDtos.TransitionTaskRequest request) {
		UUID owner = requireOwner(ownerUserId);
		TodayRepository.TaskRow current = requireTask(owner, taskId);
		long version = requireVersion(request == null ? null : request.version());
		if (STATUS_DONE.equals(current.status())) {
			return new TodayDtos.TaskResponse(toTask(current));
		}
		if (STATUS_INBOX.equals(current.status())) {
			throw new TodayServiceException(409, "TODAY_TASK_NOT_PLANNED", "날짜를 먼저 지정한 뒤 완료해주세요.");
		}
		assertVersion(current.version(), version);
		if (!repository.updateTaskStatus(owner, taskId, version, STATUS_DONE, now(), now())) {
			throw conflict();
		}
		return new TodayDtos.TaskResponse(toTask(requireTask(owner, taskId)));
	}

	public TodayDtos.TaskResponse reopenTask(UUID ownerUserId, UUID taskId, TodayDtos.TransitionTaskRequest request) {
		UUID owner = requireOwner(ownerUserId);
		TodayRepository.TaskRow current = requireTask(owner, taskId);
		long version = requireVersion(request == null ? null : request.version());
		if (STATUS_PLANNED.equals(current.status())) {
			return new TodayDtos.TaskResponse(toTask(current));
		}
		assertVersion(current.version(), version);
		if (!STATUS_DONE.equals(current.status())) {
			return new TodayDtos.TaskResponse(toTask(current));
		}
		if (!repository.updateTaskStatus(owner, taskId, version, STATUS_PLANNED, null, now())) {
			throw conflict();
		}
		return new TodayDtos.TaskResponse(toTask(requireTask(owner, taskId)));
	}

	public void deleteTask(UUID ownerUserId, UUID taskId, Long rawVersion) {
		UUID owner = requireOwner(ownerUserId);
		TodayRepository.TaskRow current = requireTask(owner, taskId);
		long version = requireVersion(rawVersion);
		assertVersion(current.version(), version);
		if (!repository.deleteTask(owner, taskId, version)) {
			throw conflict();
		}
	}

	public TodayDtos.ActivityTypesResponse listActivityTypes(UUID ownerUserId) {
		UUID owner = requireOwner(ownerUserId);
		return new TodayDtos.ActivityTypesResponse(
			ensureActivityTypes(owner).stream().map(this::toActivityType).toList()
		);
	}

	public TodayDtos.ActivityTypeResponse createActivityType(
		UUID ownerUserId,
		TodayDtos.CreateActivityTypeRequest request
	) {
		UUID owner = requireOwner(ownerUserId);
		if (request == null) {
			throw badRequest("활동 정보를 입력해주세요.");
		}
		ensureActivityTypes(owner);
		String name = normalizeRequired(request.name(), 40, "활동 이름을 입력해주세요.");
		String color = validateActivityColor(request.colorToken());
		String icon = validateActivityIcon(request.iconKey());
		int sortOrder = repository.listActivityTypes(owner).stream()
			.mapToInt(TodayRepository.ActivityTypeRow::sortOrder)
			.max()
			.orElse(-10) + 10;
		try {
			return new TodayDtos.ActivityTypeResponse(toActivityType(
				repository.insertActivityType(owner, name, color, icon, sortOrder, now())
			));
		} catch (DuplicateKeyException error) {
			throw new TodayServiceException(409, "TODAY_ACTIVITY_DUPLICATED", "같은 이름의 활동이 이미 있습니다.");
		}
	}

	public TodayDtos.ActivityTypeResponse updateActivityType(
		UUID ownerUserId,
		UUID activityTypeId,
		TodayDtos.UpdateActivityTypeRequest request
	) {
		UUID owner = requireOwner(ownerUserId);
		TodayRepository.ActivityTypeRow current = requireActivityType(owner, activityTypeId);
		long version = requireVersion(request == null ? null : request.version());
		assertVersion(current.version(), version);
		String name = normalizeRequired(request.name(), 40, "활동 이름을 입력해주세요.");
		String color = validateActivityColor(request.colorToken());
		String icon = validateActivityIcon(request.iconKey());
		if (request.sortOrder() == null || request.sortOrder() < 0 || request.active() == null) {
			throw badRequest("활동 순서와 사용 상태를 확인해주세요.");
		}
		try {
			if (!repository.updateActivityType(
				owner,
				activityTypeId,
				version,
				name,
				color,
				icon,
				request.sortOrder(),
				request.active(),
				now()
			)) {
				throw conflict();
			}
		} catch (DuplicateKeyException error) {
			throw new TodayServiceException(409, "TODAY_ACTIVITY_DUPLICATED", "같은 이름의 활동이 이미 있습니다.");
		}
		return new TodayDtos.ActivityTypeResponse(toActivityType(requireActivityType(owner, activityTypeId)));
	}

	public TodayDtos.RecordResponse getRecord(UUID ownerUserId, String rawDate) {
		UUID owner = requireOwner(ownerUserId);
		LocalDate date = parseDate(rawDate);
		ensureActivityTypes(owner);
		return buildRecord(owner, date);
	}

	public TodayDtos.RecordResponse upsertRecordSlot(
		UUID ownerUserId,
		String rawDate,
		int hour,
		TodayDtos.UpsertRecordSlotRequest request
	) {
		UUID owner = requireOwner(ownerUserId);
		LocalDate date = parseDate(rawDate);
		validateHour(hour);
		if (request == null || request.activityTypeId() == null) {
			throw badRequest("기록할 활동을 선택해주세요.");
		}
		TodayRepository.ActivityTypeRow activityType = requireActivityType(owner, request.activityTypeId());
		if (!activityType.active()) {
			throw new TodayServiceException(409, "TODAY_ACTIVITY_INACTIVE", "사용 중인 활동만 기록할 수 있습니다.");
		}
		String note = normalizeOptional(request.note(), 200, "메모는 200자 이하로 입력해주세요.");
		repository.upsertActivitySlot(owner, date, hour, activityType.id(), note, now());
		return buildRecord(owner, date);
	}

	public TodayDtos.RecordResponse deleteRecordSlot(UUID ownerUserId, String rawDate, int hour) {
		UUID owner = requireOwner(ownerUserId);
		LocalDate date = parseDate(rawDate);
		validateHour(hour);
		repository.deleteActivitySlot(owner, date, hour);
		return buildRecord(owner, date);
	}

	private TodayDtos.RecordResponse buildRecord(UUID ownerUserId, LocalDate date) {
		Map<Integer, TodayRepository.ActivitySlotRow> byHour = new LinkedHashMap<>();
		for (TodayRepository.ActivitySlotRow row : repository.listActivitySlots(ownerUserId, date)) {
			byHour.put(row.hour(), row);
		}
		List<TodayDtos.RecordSlot> slots = new ArrayList<>(24);
		Map<String, Integer> activityMinutes = new LinkedHashMap<>();
		for (int hour = 0; hour < 24; hour += 1) {
			TodayRepository.ActivitySlotRow row = byHour.get(hour);
			if (row == null) {
				slots.add(new TodayDtos.RecordSlot(hour, null, null));
				continue;
			}
			TodayDtos.ActivityType activityType = toActivityType(row.activityType());
			slots.add(new TodayDtos.RecordSlot(hour, activityType, row.note()));
			activityMinutes.merge(activityType.name(), 60, Integer::sum);
		}
		int recordedHours = byHour.size();
		return new TodayDtos.RecordResponse(
			date.toString(),
			slots,
			new TodayDtos.RecordSummary(recordedHours, (int) Math.round(recordedHours * 100.0 / 24), activityMinutes)
		);
	}

	private TodayDtos.Recommendation buildRecommendation(List<TodayRepository.TaskRow> rows) {
		TodayRepository.TaskRow candidate = rows.stream()
			.filter(row -> STATUS_PLANNED.equals(row.status()))
			.max(Comparator.comparingInt(this::recommendationScore)
				.thenComparing(TodayRepository.TaskRow::createdAt, Comparator.reverseOrder()))
			.orElse(null);
		if (candidate == null) {
			return null;
		}
		String priorityLabel = switch (candidate.priority()) {
			case PRIORITY_HIGH -> "높은 우선순위";
			case PRIORITY_LOW -> "낮은 우선순위";
			default -> "보통 우선순위";
		};
		return new TodayDtos.Recommendation(
			toTask(candidate),
			priorityLabel + " · " + candidate.estimatedMinutes() + "분 안에 시작할 수 있어요.",
			recommendationScore(candidate)
		);
	}

	private int recommendationScore(TodayRepository.TaskRow row) {
		int priorityScore = switch (row.priority()) {
			case PRIORITY_HIGH -> 300;
			case PRIORITY_NORMAL -> 200;
			default -> 100;
		};
		return priorityScore + Math.max(0, 180 - row.estimatedMinutes());
	}

	private TodayDtos.Task toTask(TodayRepository.TaskRow row) {
		return new TodayDtos.Task(
			row.id(),
			row.title(),
			row.priority(),
			row.estimatedMinutes(),
			row.categoryLabel(),
			row.status(),
			row.plannedDate() == null ? null : row.plannedDate().toString(),
			row.completedAt() == null ? null : row.completedAt().toInstant().toString(),
			row.version(),
			row.createdAt().toInstant().toString(),
			row.updatedAt().toInstant().toString()
		);
	}

	private TodayDtos.ActivityType toActivityType(TodayRepository.ActivityTypeRow row) {
		return new TodayDtos.ActivityType(
			row.id(),
			row.name(),
			row.colorToken(),
			row.iconKey(),
			row.sortOrder(),
			row.active(),
			row.version()
		);
	}

	private TodayRepository.TaskRow requireTask(UUID ownerUserId, UUID taskId) {
		if (taskId == null) {
			throw badRequest("할 일 식별자가 올바르지 않습니다.");
		}
		TodayRepository.TaskRow row = repository.findTask(ownerUserId, taskId);
		if (row == null) {
			throw new TodayServiceException(404, "TODAY_TASK_NOT_FOUND", "할 일을 찾을 수 없습니다.");
		}
		return row;
	}

	private TodayRepository.ActivityTypeRow requireActivityType(UUID ownerUserId, UUID activityTypeId) {
		if (activityTypeId == null) {
			throw badRequest("활동 식별자가 올바르지 않습니다.");
		}
		ensureActivityTypes(ownerUserId);
		TodayRepository.ActivityTypeRow row = repository.findActivityType(ownerUserId, activityTypeId);
		if (row == null) {
			throw new TodayServiceException(404, "TODAY_ACTIVITY_NOT_FOUND", "활동을 찾을 수 없습니다.");
		}
		return row;
	}

	private List<TodayRepository.ActivityTypeRow> ensureActivityTypes(UUID ownerUserId) {
		List<TodayRepository.ActivityTypeRow> activityTypes = repository.listActivityTypes(ownerUserId);
		if (activityTypes.isEmpty()) {
			repository.ensureDefaultActivityTypes(ownerUserId, DEFAULT_ACTIVITY_TYPES, now());
			return repository.listActivityTypes(ownerUserId);
		}
		return activityTypes;
	}

	private UUID requireOwner(UUID ownerUserId) {
		if (ownerUserId == null) {
			throw new TodayServiceException(401, "AUTH_REQUIRED", "로그인이 필요합니다.");
		}
		return ownerUserId;
	}

	private LocalDate parseDate(String rawDate) {
		try {
			return LocalDate.parse(rawDate);
		} catch (DateTimeException | NullPointerException error) {
			throw badRequest("날짜 형식이 올바르지 않습니다.");
		}
	}

	private LocalDate parseOptionalDate(String rawDate) {
		return rawDate == null ? null : parseDate(rawDate);
	}

	private YearMonth parseMonth(String rawMonth) {
		try {
			return YearMonth.parse(rawMonth);
		} catch (DateTimeException | NullPointerException error) {
			throw badRequest("월 형식이 올바르지 않습니다.");
		}
	}

	private String normalizeRequired(String value, int maxLength, String message) {
		String normalized = value == null ? "" : value.trim().replaceAll("\\s+", " ");
		if (normalized.isEmpty() || normalized.length() > maxLength) {
			throw badRequest(message);
		}
		return normalized;
	}

	private String normalizeOptional(String value, int maxLength, String message) {
		if (value == null) {
			return null;
		}
		String normalized = value.trim().replaceAll("\\s+", " ");
		if (normalized.isEmpty()) {
			return null;
		}
		if (normalized.length() > maxLength) {
			throw badRequest(message);
		}
		return normalized;
	}

	private String validatePriority(String priority) {
		if (!PRIORITIES.contains(priority)) {
			throw badRequest("우선순위를 확인해주세요.");
		}
		return priority;
	}

	private String resolveEditedTaskStatus(String currentStatus, LocalDate plannedDate) {
		if (plannedDate == null) {
			return STATUS_INBOX;
		}
		return STATUS_DONE.equals(currentStatus) ? STATUS_DONE : STATUS_PLANNED;
	}

	private int validateEstimatedMinutes(Integer value) {
		if (value == null || value < 1 || value > 1440) {
			throw badRequest("예상 시간은 1분 이상 1,440분 이하로 입력해주세요.");
		}
		return value;
	}

	private String validateActivityColor(String value) {
		if (!ACTIVITY_COLORS.contains(value)) {
			throw badRequest("활동 색상을 확인해주세요.");
		}
		return value;
	}

	private String validateActivityIcon(String value) {
		if (!ACTIVITY_ICONS.contains(value)) {
			throw badRequest("활동 아이콘을 확인해주세요.");
		}
		return value;
	}

	private void validateHour(int hour) {
		if (hour < 0 || hour > 23) {
			throw badRequest("시간은 0시부터 23시까지 선택할 수 있습니다.");
		}
	}

	private long requireVersion(Long version) {
		if (version == null || version < 0) {
			throw badRequest("최신 버전 정보가 필요합니다.");
		}
		return version;
	}

	private void assertVersion(long currentVersion, long expectedVersion) {
		if (currentVersion != expectedVersion) {
			throw conflict();
		}
	}

	private TodayServiceException conflict() {
		return new TodayServiceException(409, "TODAY_VERSION_CONFLICT", "다른 곳에서 변경된 내용이 있습니다. 새로고침 후 다시 시도해주세요.");
	}

	private TodayServiceException badRequest(String message) {
		return new TodayServiceException(400, "INVALID_TODAY_REQUEST", message);
	}

	private OffsetDateTime now() {
		return OffsetDateTime.now(ZoneOffset.UTC);
	}
}
