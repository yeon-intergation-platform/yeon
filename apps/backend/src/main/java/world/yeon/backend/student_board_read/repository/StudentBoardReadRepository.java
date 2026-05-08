package world.yeon.backend.student_board_read.repository;

import jakarta.persistence.EntityManager;
import java.math.BigInteger;
import java.sql.Date;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

@Repository
@Profile("jdbc")
public class StudentBoardReadRepository {

	public record SpaceContextRow(
		Long spaceInternalId,
		LocalDate startDate,
		LocalDate endDate
	) {}

	public record MemberRow(
		Long memberInternalId,
		String memberId,
		String phone
	) {}

	public record BoardSnapshotRow(
		Long memberInternalId,
		String attendanceStatus,
		OffsetDateTime attendanceMarkedAt,
		String attendanceMarkedSource,
		String assignmentStatus,
		String assignmentLink,
		OffsetDateTime assignmentMarkedAt,
		String assignmentMarkedSource,
		OffsetDateTime lastPublicCheckAt
	) {}

	public record SessionRow(
		String id,
		String title,
		String status,
		String checkMode,
		List<String> enabledMethods,
		String publicToken,
		OffsetDateTime opensAt,
		OffsetDateTime closesAt,
		String locationLabel,
		Integer radiusMeters,
		OffsetDateTime createdAt
	) {}

	public record HistoryRow(
		Long memberInternalId,
		String attendanceStatus,
		String assignmentStatus,
		String assignmentLink,
		String source,
		OffsetDateTime happenedAt
	) {}

	private final EntityManager entityManager;

	public StudentBoardReadRepository(EntityManager entityManager) {
		this.entityManager = entityManager;
	}

	public SpaceContextRow findOwnedSpaceContext(String spacePublicId, UUID userId) {
		List<?> rows = entityManager.createNativeQuery("""
			select s.id, s.start_date, s.end_date
			from public.spaces s
			where s.public_id = :spacePublicId
			  and s.created_by_user_id = :userId
			limit 1
			""")
			.setParameter("spacePublicId", spacePublicId)
			.setParameter("userId", userId)
			.getResultList();
		if (rows.isEmpty()) return null;
		return toSpaceContextRow(rows.getFirst());
	}

	public List<MemberRow> findMembersInOwnedSpace(String spacePublicId, UUID userId) {
		return entityManager.createNativeQuery("""
			select m.id, m.public_id, m.phone
			from public.members m
			inner join public.spaces s on s.id = m.space_id
			where s.public_id = :spacePublicId
			  and s.created_by_user_id = :userId
			order by m.created_at desc, m.id desc
			""")
			.setParameter("spacePublicId", spacePublicId)
			.setParameter("userId", userId)
			.getResultList()
			.stream()
			.map(this::toMemberRow)
			.toList();
	}

	public List<BoardSnapshotRow> findBoardSnapshots(Long spaceInternalId) {
		return entityManager.createNativeQuery("""
			select b.member_id, b.attendance_status, b.attendance_marked_at, b.attendance_marked_source,
			       b.assignment_status, b.assignment_link, b.assignment_marked_at, b.assignment_marked_source,
			       b.last_public_check_at
			from public.space_member_boards b
			where b.space_id = :spaceInternalId
			""")
			.setParameter("spaceInternalId", spaceInternalId)
			.getResultList()
			.stream()
			.map(this::toBoardSnapshotRow)
			.toList();
	}

	public List<SessionRow> findRecentSessions(Long spaceInternalId) {
		return entityManager.createNativeQuery("""
			select pcs.public_id, pcs.title, pcs.status, pcs.check_mode, pcs.enabled_methods, pcs.public_token,
			       pcs.opens_at, pcs.closes_at, pcs.location_label, pcs.radius_meters, pcs.created_at
			from public.public_check_sessions pcs
			where pcs.space_id = :spaceInternalId
			order by pcs.created_at desc, pcs.id desc
			limit 10
			""")
			.setParameter("spaceInternalId", spaceInternalId)
			.getResultList()
			.stream()
			.map(this::toSessionRow)
			.toList();
	}

	public List<HistoryRow> findHistoryRows(Long spaceInternalId, OffsetDateTime from, OffsetDateTime to) {
		String sql = """
			select h.member_id, h.attendance_status, h.assignment_status, h.assignment_link, h.source, h.happened_at
			from public.space_member_board_history h
			where h.space_id = :spaceInternalId
			  and h.happened_at >= :from
			""" + (to != null ? " and h.happened_at <= :to " : "") + """
			order by h.happened_at desc, h.id desc
			""";
		var query = entityManager.createNativeQuery(sql)
			.setParameter("spaceInternalId", spaceInternalId)
			.setParameter("from", Timestamp.from(from.toInstant()));
		if (to != null) query.setParameter("to", Timestamp.from(to.toInstant()));
		return query.getResultList().stream().map(this::toHistoryRow).toList();
	}

	private SpaceContextRow toSpaceContextRow(Object row) {
		if (!(row instanceof Object[] values) || values.length < 3) throw new IllegalStateException("student board space context row를 해석하지 못했습니다.");
		return new SpaceContextRow(asLong(values[0]), asLocalDate(values[1]), asLocalDate(values[2]));
	}

	private MemberRow toMemberRow(Object row) {
		if (!(row instanceof Object[] values) || values.length < 3) throw new IllegalStateException("student board member row를 해석하지 못했습니다.");
		return new MemberRow(asLong(values[0]), (String) values[1], (String) values[2]);
	}

	private BoardSnapshotRow toBoardSnapshotRow(Object row) {
		if (!(row instanceof Object[] values) || values.length < 9) throw new IllegalStateException("student board snapshot row를 해석하지 못했습니다.");
		return new BoardSnapshotRow(
			asLong(values[0]),
			(String) values[1],
			asOffsetDateTime(values[2]),
			(String) values[3],
			(String) values[4],
			(String) values[5],
			asOffsetDateTime(values[6]),
			(String) values[7],
			asOffsetDateTime(values[8])
		);
	}

	private SessionRow toSessionRow(Object row) {
		if (!(row instanceof Object[] values) || values.length < 11) throw new IllegalStateException("student board session row를 해석하지 못했습니다.");
		return new SessionRow(
			(String) values[0],
			(String) values[1],
			(String) values[2],
			(String) values[3],
			asStringList(values[4]),
			(String) values[5],
			asOffsetDateTime(values[6]),
			asOffsetDateTime(values[7]),
			(String) values[8],
			asInteger(values[9]),
			asOffsetDateTime(values[10])
		);
	}

	private HistoryRow toHistoryRow(Object row) {
		if (!(row instanceof Object[] values) || values.length < 6) throw new IllegalStateException("student board history row를 해석하지 못했습니다.");
		return new HistoryRow(asLong(values[0]), (String) values[1], (String) values[2], (String) values[3], (String) values[4], asOffsetDateTime(values[5]));
	}

	private Long asLong(Object value) {
		if (value == null) return null;
		if (value instanceof Long longValue) return longValue;
		if (value instanceof Integer intValue) return intValue.longValue();
		if (value instanceof BigInteger bigInteger) return bigInteger.longValue();
		if (value instanceof Number number) return number.longValue();
		throw new IllegalStateException("long 값으로 변환할 수 없습니다: " + value);
	}

	private Integer asInteger(Object value) {
		if (value == null) return null;
		if (value instanceof Integer intValue) return intValue;
		if (value instanceof Number number) return number.intValue();
		return Integer.parseInt(value.toString());
	}

	private LocalDate asLocalDate(Object value) {
		if (value == null) return null;
		if (value instanceof LocalDate localDate) return localDate;
		if (value instanceof Date sqlDate) return sqlDate.toLocalDate();
		return LocalDate.parse(value.toString());
	}

	private OffsetDateTime asOffsetDateTime(Object value) {
		if (value == null) return null;
		if (value instanceof OffsetDateTime offsetDateTime) return offsetDateTime;
		if (value instanceof Timestamp timestamp) return timestamp.toInstant().atOffset(java.time.ZoneOffset.UTC);
		if (value instanceof Instant instant) return instant.atOffset(java.time.ZoneOffset.UTC);
		if (value instanceof java.util.Date date) return date.toInstant().atOffset(java.time.ZoneOffset.UTC);
		if (value instanceof LocalDateTime localDateTime) return localDateTime.atOffset(java.time.ZoneOffset.UTC);
		if (value instanceof ZonedDateTime zonedDateTime) return zonedDateTime.toOffsetDateTime();
		return OffsetDateTime.parse(value.toString());
	}

	private List<String> asStringList(Object value) {
		if (value == null) return List.of();
		if (value instanceof List<?> list) return list.stream().map(String::valueOf).toList();
		if (value.getClass().isArray()) {
			Object[] array = (Object[]) value;
			List<String> result = new ArrayList<>(array.length);
			for (Object item : array) result.add(String.valueOf(item));
			return result;
		}
		String raw = value.toString().replace("{", "").replace("}", "").trim();
		if (raw.isBlank()) return List.of();
		return java.util.Arrays.stream(raw.split(",")).map(String::trim).toList();
	}
}
