package world.yeon.backend.activity_logs.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.math.BigInteger;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@Profile("jdbc")
public class ActivityLogRepository {

	public record OwnedMemberRow(
		Long memberInternalId,
		Long spaceInternalId,
		String memberId,
		String spaceId
	) {}

	public record ActivityLogRow(
		String id,
		String memberId,
		String spaceId,
		String type,
		String status,
		OffsetDateTime recordedAt,
		String source,
		Map<String, Object> metadata,
		OffsetDateTime createdAt
	) {}

	private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {};

	private final EntityManager entityManager;
	private final ObjectMapper objectMapper = new ObjectMapper();

	public ActivityLogRepository(EntityManager entityManager) {
		this.entityManager = entityManager;
	}

	public OwnedMemberRow findOwnedMemberInSpace(String spacePublicId, String memberPublicId, UUID userId) {
		List<?> rows = entityManager.createNativeQuery("""
			select m.id, s.id, m.public_id, s.public_id
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
		return toOwnedMemberRow(rows.getFirst());
	}

	public List<ActivityLogRow> findActivityLogs(Long spaceInternalId, Long memberInternalId, String type, Integer limit) {
		String sql = """
			select a.public_id, m.public_id, s.public_id, a.type, a.status, a.recorded_at, a.source, a.metadata, a.created_at
			from public.activity_logs a
			inner join public.members m on m.id = a.member_id
			inner join public.spaces s on s.id = a.space_id
			where a.space_id = :spaceInternalId
			  and a.member_id = :memberInternalId
			""" + (type != null ? " and a.type = :type " : "") + """
			order by a.recorded_at desc, a.created_at desc, a.id desc
			""";
		var query = entityManager.createNativeQuery(sql)
			.setParameter("spaceInternalId", spaceInternalId)
			.setParameter("memberInternalId", memberInternalId);
		if (type != null) query.setParameter("type", type);
		if (limit != null) query.setMaxResults(limit);
		return query.getResultList().stream().map(this::toActivityLogRow).toList();
	}

	public int countActivityLogs(Long spaceInternalId, Long memberInternalId, String type) {
		String sql = """
			select count(*)
			from public.activity_logs a
			where a.space_id = :spaceInternalId
			  and a.member_id = :memberInternalId
			""" + (type != null ? " and a.type = :type " : "");
		var query = entityManager.createNativeQuery(sql)
			.setParameter("spaceInternalId", spaceInternalId)
			.setParameter("memberInternalId", memberInternalId);
		if (type != null) query.setParameter("type", type);
		Object value = query.getSingleResult();
		return ((Number) value).intValue();
	}

	@Transactional
	public ActivityLogRow insertMemoLog(Long spaceInternalId, Long memberInternalId, String publicId, OffsetDateTime now, String type, String source, String status, String metadataJson) {
		List<?> rows = entityManager.createNativeQuery("""
			insert into public.activity_logs (
			  public_id, member_id, space_id, type, status, recorded_at, source, metadata, created_at
			) values (
			  :publicId, :memberInternalId, :spaceInternalId, :type, :status, :recordedAt, :source, cast(:metadataJson as jsonb), :createdAt
			)
			returning public_id, (select public_id from public.members where id = :memberInternalId), (select public_id from public.spaces where id = :spaceInternalId), type, status, recorded_at, source, metadata, created_at
			""")
			.setParameter("publicId", publicId)
			.setParameter("memberInternalId", memberInternalId)
			.setParameter("spaceInternalId", spaceInternalId)
			.setParameter("type", type)
			.setParameter("status", status)
			.setParameter("recordedAt", Timestamp.from(now.toInstant()))
			.setParameter("source", source)
			.setParameter("metadataJson", metadataJson)
			.setParameter("createdAt", Timestamp.from(now.toInstant()))
			.getResultList();
		return rows.isEmpty() ? null : toActivityLogRow(rows.getFirst());
	}

	private OwnedMemberRow toOwnedMemberRow(Object row) {
		if (!(row instanceof Object[] values) || values.length < 4) throw new IllegalStateException("owned member row를 해석하지 못했습니다.");
		return new OwnedMemberRow(asLong(values[0]), asLong(values[1]), (String) values[2], (String) values[3]);
	}

	private ActivityLogRow toActivityLogRow(Object row) {
		if (!(row instanceof Object[] values) || values.length < 9) throw new IllegalStateException("activity log row를 해석하지 못했습니다.");
		return new ActivityLogRow(
			(String) values[0],
			(String) values[1],
			(String) values[2],
			(String) values[3],
			(String) values[4],
			asOffsetDateTime(values[5]),
			(String) values[6],
			asMetadata(values[7]),
			asOffsetDateTime(values[8])
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

	private OffsetDateTime asOffsetDateTime(Object value) {
		if (value == null) return null;
		if (value instanceof OffsetDateTime offsetDateTime) return offsetDateTime;
		if (value instanceof Timestamp timestamp) return timestamp.toInstant().atOffset(java.time.ZoneOffset.UTC);
		if (value instanceof Instant instant) return instant.atOffset(java.time.ZoneOffset.UTC);
		if (value instanceof Date date) return date.toInstant().atOffset(java.time.ZoneOffset.UTC);
		if (value instanceof LocalDateTime localDateTime) return localDateTime.atOffset(java.time.ZoneOffset.UTC);
		if (value instanceof ZonedDateTime zonedDateTime) return zonedDateTime.toOffsetDateTime();
		return OffsetDateTime.ofInstant(Instant.parse(value.toString()), ZoneId.of("UTC"));
	}

	private Map<String, Object> asMetadata(Object value) {
		if (value == null) return null;
		if (value instanceof Map<?, ?> map) {
			return map.entrySet().stream().collect(java.util.stream.Collectors.toMap(entry -> String.valueOf(entry.getKey()), Map.Entry::getValue));
		}
		try {
			String raw = value.toString();
			if (raw == null || raw.isBlank()) return Collections.emptyMap();
			return objectMapper.readValue(raw, MAP_TYPE);
		} catch (Exception error) {
			throw new IllegalStateException("metadata json을 해석하지 못했습니다.", error);
		}
	}
}
