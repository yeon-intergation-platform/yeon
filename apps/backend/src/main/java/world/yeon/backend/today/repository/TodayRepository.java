package world.yeon.backend.today.repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class TodayRepository {
	public record TaskRow(
		UUID id,
		UUID ownerUserId,
		String title,
		String priority,
		int estimatedMinutes,
		String categoryLabel,
		String status,
		LocalDate plannedDate,
		OffsetDateTime completedAt,
		long version,
		OffsetDateTime createdAt,
		OffsetDateTime updatedAt
	) {}

	public record CalendarDayRow(LocalDate date, int totalCount, int completedCount) {}

	public record ActivityTypeRow(
		UUID id,
		UUID ownerUserId,
		String name,
		String colorToken,
		String iconKey,
		int sortOrder,
		boolean active,
		long version
	) {}

	public record ActivitySlotRow(int hour, int entryIndex, ActivityTypeRow activityType, String note) {}

	private static final String TASK_COLUMNS = """
		id, owner_user_id, title, priority, estimated_minutes, category_label,
		status, planned_date, completed_at, version, created_at, updated_at
		""";
	private static final String ACTIVITY_COLUMNS = """
		id, owner_user_id, name, color_token, icon_key, sort_order, active, version
		""";

	private final JdbcTemplate jdbc;

	public TodayRepository(JdbcTemplate jdbc) {
		this.jdbc = jdbc;
	}

	public List<TaskRow> listBoardTasks(UUID ownerUserId, LocalDate date) {
		return jdbc.query("""
			select %s
			from public.today_tasks
			where owner_user_id = ?
			  and (status = 'inbox' or planned_date = ?)
			order by
			  case status when 'planned' then 0 when 'done' then 1 else 2 end,
			  case priority when 'high' then 0 when 'normal' then 1 else 2 end,
			  created_at asc
			""".formatted(TASK_COLUMNS), TASK_MAPPER, ownerUserId, date);
	}

	public List<CalendarDayRow> listCalendar(UUID ownerUserId, LocalDate start, LocalDate end) {
		return jdbc.query("""
			select planned_date,
			       count(*)::integer as total_count,
			       count(*) filter (where status = 'done')::integer as completed_count
			from public.today_tasks
			where owner_user_id = ?
			  and planned_date between ? and ?
			group by planned_date
			order by planned_date
			""", (resultSet, rowNumber) -> new CalendarDayRow(
			resultSet.getObject("planned_date", LocalDate.class),
			resultSet.getInt("total_count"),
			resultSet.getInt("completed_count")
		), ownerUserId, start, end);
	}

	public TaskRow findTask(UUID ownerUserId, UUID taskId) {
		return first(jdbc.query(
			"select " + TASK_COLUMNS + " from public.today_tasks where owner_user_id = ? and id = ?",
			TASK_MAPPER,
			ownerUserId,
			taskId
		));
	}

	@Transactional
	public TaskRow insertTask(
		UUID ownerUserId,
		String title,
		String priority,
		int estimatedMinutes,
		String categoryLabel,
		String status,
		LocalDate plannedDate,
		OffsetDateTime now
	) {
		UUID id = UUID.randomUUID();
		jdbc.update("""
			insert into public.today_tasks (
			  id, owner_user_id, title, priority, estimated_minutes, category_label,
			  status, planned_date, completed_at, version, created_at, updated_at
			) values (?, ?, ?, ?, ?, ?, ?, ?, null, 0, ?, ?)
			""", id, ownerUserId, title, priority, estimatedMinutes, categoryLabel, status, plannedDate, now, now);
		return findTask(ownerUserId, id);
	}

	@Transactional
	public boolean updateTask(
		UUID ownerUserId,
		UUID taskId,
		long expectedVersion,
		String title,
		String priority,
		int estimatedMinutes,
		String categoryLabel,
		String status,
		LocalDate plannedDate,
		OffsetDateTime completedAt,
		OffsetDateTime now
	) {
		return jdbc.update("""
			update public.today_tasks
			set title = ?, priority = ?, estimated_minutes = ?, category_label = ?,
			    status = ?, planned_date = ?, completed_at = ?, version = version + 1, updated_at = ?
			where owner_user_id = ? and id = ? and version = ?
			""", title, priority, estimatedMinutes, categoryLabel, status, plannedDate, completedAt, now,
			ownerUserId, taskId, expectedVersion) == 1;
	}

	@Transactional
	public boolean updateTaskStatus(
		UUID ownerUserId,
		UUID taskId,
		long expectedVersion,
		String status,
		OffsetDateTime completedAt,
		OffsetDateTime now
	) {
		return jdbc.update("""
			update public.today_tasks
			set status = ?, completed_at = ?, version = version + 1, updated_at = ?
			where owner_user_id = ? and id = ? and version = ?
			""", status, completedAt, now, ownerUserId, taskId, expectedVersion) == 1;
	}

	public boolean deleteTask(UUID ownerUserId, UUID taskId, long expectedVersion) {
		return jdbc.update(
			"delete from public.today_tasks where owner_user_id = ? and id = ? and version = ?",
			ownerUserId,
			taskId,
			expectedVersion
		) == 1;
	}

	@Transactional
	public void ensureDefaultActivityTypes(UUID ownerUserId, List<ActivitySeed> seeds, OffsetDateTime now) {
		for (ActivitySeed seed : seeds) {
			jdbc.update("""
				insert into public.today_activity_types (
				  id, owner_user_id, name, color_token, icon_key, sort_order, active, version, created_at, updated_at
				) values (?, ?, ?, ?, ?, ?, true, 0, ?, ?)
				on conflict do nothing
				""", UUID.randomUUID(), ownerUserId, seed.name(), seed.colorToken(), seed.iconKey(), seed.sortOrder(), now, now);
		}
	}

	public record ActivitySeed(String name, String colorToken, String iconKey, int sortOrder) {}

	public List<ActivityTypeRow> listActivityTypes(UUID ownerUserId) {
		return jdbc.query("""
			select %s
			from public.today_activity_types
			where owner_user_id = ?
			order by active desc, sort_order asc, created_at asc
			""".formatted(ACTIVITY_COLUMNS), ACTIVITY_MAPPER, ownerUserId);
	}

	public ActivityTypeRow findActivityType(UUID ownerUserId, UUID activityTypeId) {
		return first(jdbc.query(
			"select " + ACTIVITY_COLUMNS + " from public.today_activity_types where owner_user_id = ? and id = ?",
			ACTIVITY_MAPPER,
			ownerUserId,
			activityTypeId
		));
	}

	@Transactional
	public ActivityTypeRow insertActivityType(
		UUID ownerUserId,
		String name,
		String colorToken,
		String iconKey,
		int sortOrder,
		OffsetDateTime now
	) {
		UUID id = UUID.randomUUID();
		jdbc.update("""
			insert into public.today_activity_types (
			  id, owner_user_id, name, color_token, icon_key, sort_order, active, version, created_at, updated_at
			) values (?, ?, ?, ?, ?, ?, true, 0, ?, ?)
			""", id, ownerUserId, name, colorToken, iconKey, sortOrder, now, now);
		return findActivityType(ownerUserId, id);
	}

	@Transactional
	public boolean updateActivityType(
		UUID ownerUserId,
		UUID activityTypeId,
		long expectedVersion,
		String name,
		String colorToken,
		String iconKey,
		int sortOrder,
		boolean active,
		OffsetDateTime now
	) {
		return jdbc.update("""
			update public.today_activity_types
			set name = ?, color_token = ?, icon_key = ?, sort_order = ?, active = ?,
			    version = version + 1, updated_at = ?
			where owner_user_id = ? and id = ? and version = ?
			""", name, colorToken, iconKey, sortOrder, active, now, ownerUserId, activityTypeId, expectedVersion) == 1;
	}

	public List<ActivitySlotRow> listActivitySlots(UUID ownerUserId, LocalDate date) {
		return jdbc.query("""
			select s.hour, s.entry_index, s.note,
			       a.id, a.owner_user_id, a.name, a.color_token, a.icon_key, a.sort_order, a.active, a.version
			from public.today_activity_slots s
			join public.today_activity_types a on a.id = s.activity_type_id
			where s.owner_user_id = ? and s.record_date = ?
			order by s.hour, s.entry_index
			""", (resultSet, rowNumber) -> new ActivitySlotRow(
			resultSet.getInt("hour"),
			resultSet.getInt("entry_index"),
			new ActivityTypeRow(
				resultSet.getObject("id", UUID.class),
				resultSet.getObject("owner_user_id", UUID.class),
				resultSet.getString("name"),
				resultSet.getString("color_token"),
				resultSet.getString("icon_key"),
				resultSet.getInt("sort_order"),
				resultSet.getBoolean("active"),
				resultSet.getLong("version")
			),
			resultSet.getString("note")
		), ownerUserId, date);
	}

	@Transactional
	public boolean appendActivitySlot(
		UUID ownerUserId,
		LocalDate date,
		int hour,
		UUID activityTypeId,
		String note,
		OffsetDateTime now
	) {
		if (insertActivitySlotEntry(ownerUserId, date, hour, 0, activityTypeId, note, now)) {
			return true;
		}
		return insertActivitySlotEntry(ownerUserId, date, hour, 1, activityTypeId, note, now);
	}

	private boolean insertActivitySlotEntry(
		UUID ownerUserId,
		LocalDate date,
		int hour,
		int entryIndex,
		UUID activityTypeId,
		String note,
		OffsetDateTime now
	) {
		return jdbc.update("""
			insert into public.today_activity_slots (
			  id, owner_user_id, record_date, hour, entry_index,
			  activity_type_id, note, created_at, updated_at
			)
			values (?, ?, ?, ?, ?, ?, ?, ?, ?)
			on conflict (owner_user_id, record_date, hour, entry_index) do nothing
			""", UUID.randomUUID(), ownerUserId, date, hour, entryIndex, activityTypeId, note, now, now) == 1;
	}

	public boolean updateActivitySlotEntry(
		UUID ownerUserId,
		LocalDate date,
		int hour,
		int entryIndex,
		UUID activityTypeId,
		String note,
		OffsetDateTime now
	) {
		return jdbc.update("""
			update public.today_activity_slots
			set activity_type_id = ?, note = ?, updated_at = ?
			where owner_user_id = ? and record_date = ? and hour = ? and entry_index = ?
			""", activityTypeId, note, now, ownerUserId, date, hour, entryIndex) == 1;
	}

	public void deleteActivitySlot(UUID ownerUserId, LocalDate date, int hour) {
		jdbc.update(
			"delete from public.today_activity_slots where owner_user_id = ? and record_date = ? and hour = ?",
			ownerUserId,
			date,
			hour
		);
	}

	@Transactional
	public boolean deleteActivitySlotEntry(UUID ownerUserId, LocalDate date, int hour, int entryIndex) {
		int deleted = jdbc.update(
			"delete from public.today_activity_slots where owner_user_id = ? and record_date = ? and hour = ? and entry_index = ?",
			ownerUserId,
			date,
			hour,
			entryIndex
		);
		if (deleted == 0) {
			return false;
		}
		jdbc.update("""
			update public.today_activity_slots
			set entry_index = 0
			where owner_user_id = ? and record_date = ? and hour = ? and entry_index = 1
			""", ownerUserId, date, hour);
		return true;
	}

	private static final RowMapper<TaskRow> TASK_MAPPER = (resultSet, rowNumber) -> new TaskRow(
		resultSet.getObject("id", UUID.class),
		resultSet.getObject("owner_user_id", UUID.class),
		resultSet.getString("title"),
		resultSet.getString("priority"),
		resultSet.getInt("estimated_minutes"),
		resultSet.getString("category_label"),
		resultSet.getString("status"),
		resultSet.getObject("planned_date", LocalDate.class),
		asOffsetDateTime(resultSet, "completed_at"),
		resultSet.getLong("version"),
		asOffsetDateTime(resultSet, "created_at"),
		asOffsetDateTime(resultSet, "updated_at")
	);

	private static final RowMapper<ActivityTypeRow> ACTIVITY_MAPPER = (resultSet, rowNumber) -> new ActivityTypeRow(
		resultSet.getObject("id", UUID.class),
		resultSet.getObject("owner_user_id", UUID.class),
		resultSet.getString("name"),
		resultSet.getString("color_token"),
		resultSet.getString("icon_key"),
		resultSet.getInt("sort_order"),
		resultSet.getBoolean("active"),
		resultSet.getLong("version")
	);

	private static OffsetDateTime asOffsetDateTime(ResultSet resultSet, String column) throws SQLException {
		Timestamp value = resultSet.getTimestamp(column);
		return value == null ? null : value.toInstant().atOffset(ZoneOffset.UTC);
	}

	private static <T> T first(List<T> rows) {
		return rows.isEmpty() ? null : rows.getFirst();
	}
}
