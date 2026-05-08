package world.yeon.backend.public_check_sessions.repository;

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
public class PublicCheckSessionRepository {

	public record SessionRow(
		Long sessionInternalId,
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

	private final EntityManager entityManager;

	public PublicCheckSessionRepository(EntityManager entityManager) {
		this.entityManager = entityManager;
	}

	public Long findOwnedSpaceInternalId(String spacePublicId, UUID userId) {
		List<?> rows = entityManager.createNativeQuery("""
			select s.id
			from public.spaces s
			where s.public_id = :spacePublicId
			  and s.created_by_user_id = :userId
			limit 1
			""")
			.setParameter("spacePublicId", spacePublicId)
			.setParameter("userId", userId)
			.getResultList();
		if (rows.isEmpty()) return null;
		return asLong(rows.getFirst());
	}

	@Transactional
	public SessionRow insertSession(
		Long spaceInternalId,
		String publicId,
		String title,
		String publicToken,
		String status,
		String checkMode,
		List<String> enabledMethods,
		OffsetDateTime opensAt,
		OffsetDateTime closesAt,
		String locationLabel,
		Double latitude,
		Double longitude,
		Integer radiusMeters,
		UUID createdByUserId,
		OffsetDateTime now
	) {
		List<?> rows = entityManager.createNativeQuery("""
			insert into public.public_check_sessions (
			  public_id, space_id, title, public_token, status, check_mode, enabled_methods, verification_method,
			  opens_at, closes_at, location_label, latitude, longitude, radius_meters, created_by_user_id, created_at, updated_at
			) values (
			  :publicId, :spaceInternalId, :title, :publicToken, :status, :checkMode, cast(:enabledMethods as text[]), 'name_phone_last4',
			  :opensAt, :closesAt, :locationLabel, :latitude, :longitude, :radiusMeters, :createdByUserId, :createdAt, :updatedAt
			)
			returning id, public_id, title, status, check_mode, enabled_methods, public_token, opens_at, closes_at, location_label, radius_meters, created_at
			""")
			.setParameter("publicId", publicId)
			.setParameter("spaceInternalId", spaceInternalId)
			.setParameter("title", title)
			.setParameter("publicToken", publicToken)
			.setParameter("status", status)
			.setParameter("checkMode", checkMode)
			.setParameter("enabledMethods", "{" + String.join(",", enabledMethods) + "}")
			.setParameter("opensAt", opensAt == null ? null : Timestamp.from(opensAt.toInstant()))
			.setParameter("closesAt", closesAt == null ? null : Timestamp.from(closesAt.toInstant()))
			.setParameter("locationLabel", locationLabel)
			.setParameter("latitude", latitude)
			.setParameter("longitude", longitude)
			.setParameter("radiusMeters", radiusMeters)
			.setParameter("createdByUserId", createdByUserId)
			.setParameter("createdAt", Timestamp.from(now.toInstant()))
			.setParameter("updatedAt", Timestamp.from(now.toInstant()))
			.getResultList();
		return rows.isEmpty() ? null : toSessionRow(rows.getFirst());
	}

	@Transactional
	public SessionRow updateOwnedSession(Long spaceInternalId, String sessionPublicId, String status, OffsetDateTime closesAt, OffsetDateTime now) {
		List<?> rows = entityManager.createNativeQuery("""
			update public.public_check_sessions pcs
			set status = coalesce(:status, pcs.status),
			    closes_at = :closesAtSpecified = true ? :closesAt : pcs.closes_at,
			    updated_at = :updatedAt
			where pcs.public_id = :sessionPublicId
			  and pcs.space_id = :spaceInternalId
			returning pcs.id, pcs.public_id, pcs.title, pcs.status, pcs.check_mode, pcs.enabled_methods, pcs.public_token, pcs.opens_at, pcs.closes_at, pcs.location_label, pcs.radius_meters, pcs.created_at
			""".replace(":closesAtSpecified = true ? :closesAt : pcs.closes_at", "case when :closesAtSpecified then :closesAt else pcs.closes_at end"))
			.setParameter("status", status)
			.setParameter("closesAt", closesAt == null ? null : Timestamp.from(closesAt.toInstant()))
			.setParameter("closesAtSpecified", true)
			.setParameter("updatedAt", Timestamp.from(now.toInstant()))
			.setParameter("sessionPublicId", sessionPublicId)
			.setParameter("spaceInternalId", spaceInternalId)
			.getResultList();
		return rows.isEmpty() ? null : toSessionRow(rows.getFirst());
	}

	@Transactional
	public SessionRow updateOwnedSessionWithoutClosesAt(Long spaceInternalId, String sessionPublicId, String status, OffsetDateTime now) {
		List<?> rows = entityManager.createNativeQuery("""
			update public.public_check_sessions pcs
			set status = coalesce(:status, pcs.status),
			    updated_at = :updatedAt
			where pcs.public_id = :sessionPublicId
			  and pcs.space_id = :spaceInternalId
			returning pcs.id, pcs.public_id, pcs.title, pcs.status, pcs.check_mode, pcs.enabled_methods, pcs.public_token, pcs.opens_at, pcs.closes_at, pcs.location_label, pcs.radius_meters, pcs.created_at
			""")
			.setParameter("status", status)
			.setParameter("updatedAt", Timestamp.from(now.toInstant()))
			.setParameter("sessionPublicId", sessionPublicId)
			.setParameter("spaceInternalId", spaceInternalId)
			.getResultList();
		return rows.isEmpty() ? null : toSessionRow(rows.getFirst());
	}

	private SessionRow toSessionRow(Object row) {
		if (!(row instanceof Object[] values) || values.length < 12) throw new IllegalStateException("public check session row를 해석하지 못했습니다.");
		return new SessionRow(
			asLong(values[0]),
			(String) values[1],
			(String) values[2],
			(String) values[3],
			(String) values[4],
			asStringList(values[5]),
			(String) values[6],
			asOffsetDateTime(values[7]),
			asOffsetDateTime(values[8]),
			(String) values[9],
			asInteger(values[10]),
			asOffsetDateTime(values[11])
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

	private Integer asInteger(Object value) {
		if (value == null) return null;
		if (value instanceof Integer intValue) return intValue;
		if (value instanceof Number number) return number.intValue();
		return Integer.parseInt(value.toString());
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

	@SuppressWarnings("unchecked")
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
