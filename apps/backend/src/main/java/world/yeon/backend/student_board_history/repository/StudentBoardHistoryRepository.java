package world.yeon.backend.student_board_history.repository;

import jakarta.persistence.EntityManager;
import java.math.BigInteger;
import java.sql.Date;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class StudentBoardHistoryRepository {

	public record MemberContextRow(
		Long spaceInternalId,
		Long memberInternalId,
		String memberPublicId,
		String memberName,
		LocalDate spaceStartDate,
		LocalDate spaceEndDate
	) {}

	public record BoardHistoryRow(
		String id,
		Long memberInternalId,
		String attendanceStatus,
		String assignmentStatus,
		String assignmentLink,
		String source,
		OffsetDateTime happenedAt
	) {}

	private final EntityManager entityManager;

	public StudentBoardHistoryRepository(EntityManager entityManager) {
		this.entityManager = entityManager;
	}

	public MemberContextRow findOwnedMemberContext(String spacePublicId, String memberPublicId, UUID userId) {
		List<?> rows = entityManager.createNativeQuery("""
			select s.id, m.id, m.public_id, m.name, s.start_date, s.end_date
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
		return toMemberContextRow(rows.getFirst());
	}

	public List<BoardHistoryRow> findHistoryRows(Long spaceInternalId, Long memberInternalId, OffsetDateTime from, OffsetDateTime to) {
		String sql = """
			select h.public_id, h.member_id, h.attendance_status, h.assignment_status, h.assignment_link, h.source, h.happened_at
			from public.space_member_board_history h
			where h.space_id = :spaceInternalId
			  and h.member_id = :memberInternalId
			  and h.happened_at >= :from
			""" + (to != null ? " and h.happened_at <= :to " : "") + """
			order by h.happened_at desc, h.id desc
			""";
		var query = entityManager.createNativeQuery(sql)
			.setParameter("spaceInternalId", spaceInternalId)
			.setParameter("memberInternalId", memberInternalId)
			.setParameter("from", Timestamp.from(from.toInstant()));
		if (to != null) query.setParameter("to", Timestamp.from(to.toInstant()));
		return query.getResultList().stream().map(this::toBoardHistoryRow).toList();
	}

	private MemberContextRow toMemberContextRow(Object row) {
		if (!(row instanceof Object[] values) || values.length < 6) throw new IllegalStateException("member context row를 해석하지 못했습니다.");
		return new MemberContextRow(
			asLong(values[0]),
			asLong(values[1]),
			(String) values[2],
			(String) values[3],
			asLocalDate(values[4]),
			asLocalDate(values[5])
		);
	}

	private BoardHistoryRow toBoardHistoryRow(Object row) {
		if (!(row instanceof Object[] values) || values.length < 7) throw new IllegalStateException("board history row를 해석하지 못했습니다.");
		return new BoardHistoryRow(
			(String) values[0],
			asLong(values[1]),
			(String) values[2],
			(String) values[3],
			(String) values[4],
			(String) values[5],
			asOffsetDateTime(values[6])
		);
	}

	private Long asLong(Object value) {
		if (value == null) return null;
		if (value instanceof Long longValue) return longValue;
		if (value instanceof Integer intValue) return intValue.longValue();
		if (value instanceof BigInteger bigInteger) return bigInteger.longValue();
		if (value instanceof Number number) return number.longValue();
		throw new IllegalStateException("long 값으로 변환할 수 없습니다: " + value);
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
}
