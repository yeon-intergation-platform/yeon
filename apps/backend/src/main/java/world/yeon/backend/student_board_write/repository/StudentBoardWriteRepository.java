package world.yeon.backend.student_board_write.repository;

import jakarta.persistence.EntityManager;
import java.math.BigInteger;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZonedDateTime;
import java.util.UUID;
import java.util.List;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class StudentBoardWriteRepository {

	public record OwnedMemberContextRow(Long spaceInternalId, Long memberInternalId) {}

	public record BoardSnapshotRow(
		String attendanceStatus,
		OffsetDateTime attendanceMarkedAt,
		String attendanceMarkedSource,
		String assignmentStatus,
		String assignmentLink,
		OffsetDateTime assignmentMarkedAt,
		String assignmentMarkedSource,
		OffsetDateTime lastPublicCheckAt,
		UUID updatedByUserId
	) {}

	private final EntityManager entityManager;

	public StudentBoardWriteRepository(EntityManager entityManager) {
		this.entityManager = entityManager;
	}

	public OwnedMemberContextRow findOwnedMemberContext(String spacePublicId, String memberPublicId, UUID userId) {
		List<?> rows = entityManager.createNativeQuery("""
			select s.id, m.id
			from public.members m
			inner join public.spaces s on s.id = m.space_id
			where s.public_id = :spacePublicId
			  and m.public_id = :memberPublicId
			  and s.created_by_user_id = :userId
			limit 1
			""")
			.setParameter("spacePublicId", spacePublicId)
			.setParameter("memberPublicId", memberPublicId)
			.setParameter("userId", userId)
			.getResultList();
		if (rows.isEmpty()) return null;
		Object row = rows.getFirst();
		if (!(row instanceof Object[] values) || values.length < 2) throw new IllegalStateException("student board owned member context row를 해석하지 못했습니다.");
		return new OwnedMemberContextRow(asLong(values[0]), asLong(values[1]));
	}

	public BoardSnapshotRow findBoardSnapshot(Long spaceInternalId, Long memberInternalId) {
		List<?> rows = entityManager.createNativeQuery("""
			select attendance_status, attendance_marked_at, attendance_marked_source,
			       assignment_status, assignment_link, assignment_marked_at, assignment_marked_source,
			       last_public_check_at, updated_by_user_id
			from public.space_member_boards
			where space_id = :spaceInternalId
			  and member_id = :memberInternalId
			limit 1
			""")
			.setParameter("spaceInternalId", spaceInternalId)
			.setParameter("memberInternalId", memberInternalId)
			.getResultList();
		if (rows.isEmpty()) return null;
		Object row = rows.getFirst();
		if (!(row instanceof Object[] values) || values.length < 9) throw new IllegalStateException("student board snapshot row를 해석하지 못했습니다.");
		return new BoardSnapshotRow(
			(String) values[0],
			asOffsetDateTime(values[1]),
			(String) values[2],
			(String) values[3],
			(String) values[4],
			asOffsetDateTime(values[5]),
			(String) values[6],
			asOffsetDateTime(values[7]),
			asUuid(values[8])
		);
	}

	@Transactional
	public void upsertBoardSnapshot(
		String publicId,
		Long spaceInternalId,
		Long memberInternalId,
		String attendanceStatus,
		OffsetDateTime attendanceMarkedAt,
		String attendanceMarkedSource,
		String assignmentStatus,
		String assignmentLink,
		OffsetDateTime assignmentMarkedAt,
		String assignmentMarkedSource,
		OffsetDateTime lastPublicCheckAt,
		UUID updatedByUserId,
		OffsetDateTime updatedAt
	) {
		entityManager.createNativeQuery("""
			insert into public.space_member_boards (
			  public_id, space_id, member_id,
			  attendance_status, attendance_marked_at, attendance_marked_source,
			  assignment_status, assignment_link, assignment_marked_at, assignment_marked_source,
			  last_public_check_at, updated_by_user_id, updated_at, created_at
			) values (
			  :publicId, :spaceInternalId, :memberInternalId,
			  :attendanceStatus, :attendanceMarkedAt, :attendanceMarkedSource,
			  :assignmentStatus, :assignmentLink, :assignmentMarkedAt, :assignmentMarkedSource,
			  :lastPublicCheckAt, :updatedByUserId, :updatedAt, :updatedAt
			)
			on conflict (space_id, member_id) do update set
			  attendance_status = excluded.attendance_status,
			  attendance_marked_at = excluded.attendance_marked_at,
			  attendance_marked_source = excluded.attendance_marked_source,
			  assignment_status = excluded.assignment_status,
			  assignment_link = excluded.assignment_link,
			  assignment_marked_at = excluded.assignment_marked_at,
			  assignment_marked_source = excluded.assignment_marked_source,
			  last_public_check_at = excluded.last_public_check_at,
			  updated_by_user_id = excluded.updated_by_user_id,
			  updated_at = excluded.updated_at
			""")
			.setParameter("publicId", publicId)
			.setParameter("spaceInternalId", spaceInternalId)
			.setParameter("memberInternalId", memberInternalId)
			.setParameter("attendanceStatus", attendanceStatus)
			.setParameter("attendanceMarkedAt", toTimestamp(attendanceMarkedAt))
			.setParameter("attendanceMarkedSource", attendanceMarkedSource)
			.setParameter("assignmentStatus", assignmentStatus)
			.setParameter("assignmentLink", assignmentLink)
			.setParameter("assignmentMarkedAt", toTimestamp(assignmentMarkedAt))
			.setParameter("assignmentMarkedSource", assignmentMarkedSource)
			.setParameter("lastPublicCheckAt", toTimestamp(lastPublicCheckAt))
			.setParameter("updatedByUserId", updatedByUserId)
			.setParameter("updatedAt", toTimestamp(updatedAt))
			.executeUpdate();
	}

	@Transactional
	public void insertHistory(
		String publicId,
		Long spaceInternalId,
		Long memberInternalId,
		String attendanceStatus,
		String assignmentStatus,
		String assignmentLink,
		String source,
		UUID updatedByUserId,
		OffsetDateTime happenedAt
	) {
		entityManager.createNativeQuery("""
			insert into public.space_member_board_history (
			  public_id, space_id, member_id, session_id,
			  attendance_status, assignment_status, assignment_link,
			  source, updated_by_user_id, happened_at, created_at
			) values (
			  :publicId, :spaceInternalId, :memberInternalId, null,
			  :attendanceStatus, :assignmentStatus, :assignmentLink,
			  :source, :updatedByUserId, :happenedAt, :happenedAt
			)
			""")
			.setParameter("publicId", publicId)
			.setParameter("spaceInternalId", spaceInternalId)
			.setParameter("memberInternalId", memberInternalId)
			.setParameter("attendanceStatus", attendanceStatus)
			.setParameter("assignmentStatus", assignmentStatus)
			.setParameter("assignmentLink", assignmentLink)
			.setParameter("source", source)
			.setParameter("updatedByUserId", updatedByUserId)
			.setParameter("happenedAt", toTimestamp(happenedAt))
			.executeUpdate();
	}

	private Timestamp toTimestamp(OffsetDateTime value) {
		return value == null ? null : Timestamp.from(value.toInstant());
	}

	private Long asLong(Object value) {
		if (value == null) return null;
		if (value instanceof Long longValue) return longValue;
		if (value instanceof Integer intValue) return intValue.longValue();
		if (value instanceof BigInteger bigInteger) return bigInteger.longValue();
		if (value instanceof Number number) return number.longValue();
		throw new IllegalStateException("long 값으로 변환할 수 없습니다: " + value);
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

	private UUID asUuid(Object value) {
		if (value == null) return null;
		if (value instanceof UUID uuid) return uuid;
		return UUID.fromString(value.toString());
	}
}
