package world.yeon.backend.public_check_runtime.repository;

import jakarta.persistence.EntityManager;
import java.math.BigInteger;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@Profile("jdbc")
public class PublicCheckRuntimeRepository {
	public record SessionContextRow(
		Long sessionInternalId,
		String sessionPublicId,
		Long spaceInternalId,
		String spacePublicId,
		String title,
		String status,
		String checkMode,
		List<String> enabledMethods,
		String locationLabel,
		Double latitude,
		Double longitude,
		Integer radiusMeters,
		OffsetDateTime opensAt,
		OffsetDateTime closesAt,
		String publicToken
	) {}

	public record MemberRow(
		Long memberInternalId,
		String memberPublicId,
		String name,
		String phone
	) {}

	public record BoardSnapshotRow(
		String attendanceStatus,
		OffsetDateTime attendanceMarkedAt,
		String attendanceMarkedSource,
		String assignmentStatus,
		String assignmentLink,
		OffsetDateTime assignmentMarkedAt,
		String assignmentMarkedSource,
		OffsetDateTime lastPublicCheckAt
	) {}

	private final EntityManager entityManager;

	public PublicCheckRuntimeRepository(EntityManager entityManager) {
		this.entityManager = entityManager;
	}

	public SessionContextRow findSessionByPublicToken(String token) {
		List<?> rows = entityManager.createNativeQuery("""
			select pcs.id, pcs.public_id, pcs.space_id, s.public_id, pcs.title, pcs.status, pcs.check_mode,
			       pcs.enabled_methods, pcs.location_label, pcs.latitude, pcs.longitude, pcs.radius_meters,
			       pcs.opens_at, pcs.closes_at, pcs.public_token
			from public.public_check_sessions pcs
			inner join public.spaces s on s.id = pcs.space_id
			where pcs.public_token = :token
			limit 1
			""")
			.setParameter("token", token)
			.getResultList();
		if (rows.isEmpty()) return null;
		return toSessionContextRow(rows.getFirst());
	}

	public List<MemberRow> findMembersInSpace(Long spaceInternalId) {
		return entityManager.createNativeQuery("""
			select m.id, m.public_id, m.name, m.phone
			from public.members m
			where m.space_id = :spaceInternalId
			""")
			.setParameter("spaceInternalId", spaceInternalId)
			.getResultList().stream().map(this::toMemberRow).toList();
	}

	public MemberRow findMemberByPublicId(Long spaceInternalId, String memberPublicId) {
		List<?> rows = entityManager.createNativeQuery("""
			select m.id, m.public_id, m.name, m.phone
			from public.members m
			where m.space_id = :spaceInternalId
			  and m.public_id = :memberPublicId
			limit 1
			""")
			.setParameter("spaceInternalId", spaceInternalId)
			.setParameter("memberPublicId", memberPublicId)
			.getResultList();
		if (rows.isEmpty()) return null;
		return toMemberRow(rows.getFirst());
	}

	public BoardSnapshotRow findBoardSnapshot(Long spaceInternalId, Long memberInternalId) {
		List<?> rows = entityManager.createNativeQuery("""
			select attendance_status, attendance_marked_at, attendance_marked_source,
			       assignment_status, assignment_link, assignment_marked_at, assignment_marked_source,
			       last_public_check_at
			from public.space_member_boards
			where space_id = :spaceInternalId and member_id = :memberInternalId
			limit 1
			""")
			.setParameter("spaceInternalId", spaceInternalId)
			.setParameter("memberInternalId", memberInternalId)
			.getResultList();
		if (rows.isEmpty()) return null;
		Object row = rows.getFirst();
		Object[] values = (Object[]) row;
		return new BoardSnapshotRow(
			(String) values[0],
			asOffsetDateTime(values[1]),
			(String) values[2],
			(String) values[3],
			(String) values[4],
			asOffsetDateTime(values[5]),
			(String) values[6],
			asOffsetDateTime(values[7])
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
			  :lastPublicCheckAt, null, :updatedAt, :updatedAt
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
			.setParameter("updatedAt", toTimestamp(updatedAt))
			.executeUpdate();
	}

	@Transactional
	public void insertBoardHistory(
		String publicId,
		Long spaceInternalId,
		Long memberInternalId,
		Long sessionInternalId,
		String attendanceStatus,
		String assignmentStatus,
		String assignmentLink,
		String source,
		OffsetDateTime happenedAt
	) {
		entityManager.createNativeQuery("""
			insert into public.space_member_board_history (
			  public_id, space_id, member_id, session_id,
			  attendance_status, assignment_status, assignment_link,
			  source, updated_by_user_id, happened_at, created_at
			) values (
			  :publicId, :spaceInternalId, :memberInternalId, :sessionInternalId,
			  :attendanceStatus, :assignmentStatus, :assignmentLink,
			  :source, null, :happenedAt, :happenedAt
			)
			""")
			.setParameter("publicId", publicId)
			.setParameter("spaceInternalId", spaceInternalId)
			.setParameter("memberInternalId", memberInternalId)
			.setParameter("sessionInternalId", sessionInternalId)
			.setParameter("attendanceStatus", attendanceStatus)
			.setParameter("assignmentStatus", assignmentStatus)
			.setParameter("assignmentLink", assignmentLink)
			.setParameter("source", source)
			.setParameter("happenedAt", toTimestamp(happenedAt))
			.executeUpdate();
	}

	@Transactional
	public void insertSubmission(
		String publicId,
		Long sessionInternalId,
		Long spaceInternalId,
		Long memberInternalId,
		String checkMethod,
		String verificationStatus,
		String submittedName,
		String submittedPhoneLast4,
		String assignmentStatus,
		String assignmentLink,
		Double latitude,
		Double longitude,
		Integer distanceMeters,
		String metadataJson
	) {
		entityManager.createNativeQuery("""
			insert into public.public_check_submissions (
			  public_id, session_id, space_id, member_id, check_method, verification_status,
			  submitted_name, submitted_phone_last4, assignment_status, assignment_link,
			  latitude, longitude, distance_meters, metadata, created_at
			) values (
			  :publicId, :sessionInternalId, :spaceInternalId, :memberInternalId, :checkMethod, :verificationStatus,
			  :submittedName, :submittedPhoneLast4, :assignmentStatus, :assignmentLink,
			  :latitude, :longitude, :distanceMeters, cast(:metadataJson as jsonb), now()
			)
			""")
			.setParameter("publicId", publicId)
			.setParameter("sessionInternalId", sessionInternalId)
			.setParameter("spaceInternalId", spaceInternalId)
			.setParameter("memberInternalId", memberInternalId)
			.setParameter("checkMethod", checkMethod)
			.setParameter("verificationStatus", verificationStatus)
			.setParameter("submittedName", submittedName)
			.setParameter("submittedPhoneLast4", submittedPhoneLast4)
			.setParameter("assignmentStatus", assignmentStatus)
			.setParameter("assignmentLink", assignmentLink)
			.setParameter("latitude", latitude)
			.setParameter("longitude", longitude)
			.setParameter("distanceMeters", distanceMeters)
			.setParameter("metadataJson", metadataJson)
			.executeUpdate();
	}

	private SessionContextRow toSessionContextRow(Object row) {
		Object[] values = (Object[]) row;
		return new SessionContextRow(
			asLong(values[0]),
			(String) values[1],
			asLong(values[2]),
			(String) values[3],
			(String) values[4],
			(String) values[5],
			(String) values[6],
			asStringList(values[7]),
			(String) values[8],
			asDouble(values[9]),
			asDouble(values[10]),
			asInteger(values[11]),
			asOffsetDateTime(values[12]),
			asOffsetDateTime(values[13]),
			(String) values[14]
		);
	}

	private MemberRow toMemberRow(Object row) {
		Object[] values = (Object[]) row;
		return new MemberRow(asLong(values[0]), (String) values[1], (String) values[2], (String) values[3]);
	}

	private Timestamp toTimestamp(OffsetDateTime value) { return value == null ? null : Timestamp.from(value.toInstant()); }
	private Long asLong(Object value) { if (value == null) return null; if (value instanceof Long l) return l; if (value instanceof Integer i) return i.longValue(); if (value instanceof BigInteger b) return b.longValue(); if (value instanceof Number n) return n.longValue(); throw new IllegalStateException("long 값으로 변환할 수 없습니다: " + value); }
	private Integer asInteger(Object value) { if (value == null) return null; if (value instanceof Integer i) return i; if (value instanceof Number n) return n.intValue(); return Integer.parseInt(value.toString()); }
	private Double asDouble(Object value) { if (value == null) return null; if (value instanceof Double d) return d; if (value instanceof Number n) return n.doubleValue(); return Double.parseDouble(value.toString()); }
	private OffsetDateTime asOffsetDateTime(Object value) { if (value == null) return null; if (value instanceof OffsetDateTime o) return o; if (value instanceof Timestamp t) return t.toInstant().atOffset(java.time.ZoneOffset.UTC); if (value instanceof Instant i) return i.atOffset(java.time.ZoneOffset.UTC); if (value instanceof java.util.Date d) return d.toInstant().atOffset(java.time.ZoneOffset.UTC); if (value instanceof LocalDateTime l) return l.atOffset(java.time.ZoneOffset.UTC); if (value instanceof ZonedDateTime z) return z.toOffsetDateTime(); return OffsetDateTime.parse(value.toString()); }
	private List<String> asStringList(Object value) { if (value == null) return List.of(); if (value instanceof List<?> list) return list.stream().map(String::valueOf).toList(); if (value.getClass().isArray()) { Object[] array = (Object[]) value; List<String> result = new ArrayList<>(array.length); for (Object item : array) result.add(String.valueOf(item)); return result; } String raw = value.toString().replace("{", "").replace("}", "").trim(); if (raw.isBlank()) return List.of(); return java.util.Arrays.stream(raw.split(",")).map(String::trim).toList(); }
}
