package world.yeon.backend.life_os.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceException;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.life_os.dto.LifeOsHourEntryDto;

@Repository
@Profile("jdbc")
public class LifeOsRepository {
	public record LifeOsDayRow(
		Long internalId,
		String publicId,
		UUID ownerUserId,
		String localDate,
		String timezone,
		String mindset,
		String backlogText,
		List<LifeOsHourEntryDto> entries,
		OffsetDateTime createdAt,
		OffsetDateTime updatedAt
	) {}

	private static final TypeReference<List<Map<String, Object>>> LIST_MAP_TYPE = new TypeReference<>() {};
	private final EntityManager entityManager;
	private final ObjectMapper objectMapper = new ObjectMapper();

	public LifeOsRepository(EntityManager entityManager) {
		this.entityManager = entityManager;
	}

	public List<LifeOsDayRow> listDays(UUID userId) {
		return entityManager.createNativeQuery("""
			select id, public_id, owner_user_id, local_date, timezone, mindset, backlog_text, entries, created_at, updated_at
			from public.life_os_days
			where owner_user_id = :userId
			order by local_date desc
			limit 60
			""")
			.setParameter("userId", userId)
			.getResultList()
			.stream()
			.map(this::toRow)
			.toList();
	}

	public LifeOsDayRow findDay(UUID userId, String localDate) {
		List<?> rows = entityManager.createNativeQuery("""
			select id, public_id, owner_user_id, local_date, timezone, mindset, backlog_text, entries, created_at, updated_at
			from public.life_os_days
			where owner_user_id = :userId and local_date = :localDate
			limit 1
			""")
			.setParameter("userId", userId)
			.setParameter("localDate", localDate)
			.getResultList();
		return rows.isEmpty() ? null : toRow(rows.getFirst());
	}

	public List<LifeOsDayRow> findDaysBetween(UUID userId, String periodStart, String periodEnd) {
		return entityManager.createNativeQuery("""
			select id, public_id, owner_user_id, local_date, timezone, mindset, backlog_text, entries, created_at, updated_at
			from public.life_os_days
			where owner_user_id = :userId and local_date >= :periodStart and local_date <= :periodEnd
			order by local_date asc
			""")
			.setParameter("userId", userId)
			.setParameter("periodStart", periodStart)
			.setParameter("periodEnd", periodEnd)
			.getResultList()
			.stream()
			.map(this::toRow)
			.toList();
	}

	@Transactional
	public LifeOsDayRow upsertDay(UUID userId, String publicId, String localDate, String timezone, String mindset, String backlogText, String entriesJson, OffsetDateTime now) {
		try {
			List<?> rows = entityManager.createNativeQuery("""
				insert into public.life_os_days (
					public_id, owner_user_id, local_date, timezone, mindset, backlog_text, entries, created_at, updated_at
				) values (
					:publicId, :userId, :localDate, :timezone, :mindset, :backlogText, cast(:entriesJson as jsonb), :createdAt, :updatedAt
				)
				on conflict (owner_user_id, local_date)
				do update set
					timezone = excluded.timezone,
					mindset = excluded.mindset,
					backlog_text = excluded.backlog_text,
					entries = excluded.entries,
					updated_at = excluded.updated_at
				returning id, public_id, owner_user_id, local_date, timezone, mindset, backlog_text, entries, created_at, updated_at
				""")
				.setParameter("publicId", publicId)
				.setParameter("userId", userId)
				.setParameter("localDate", localDate)
				.setParameter("timezone", timezone)
				.setParameter("mindset", mindset)
				.setParameter("backlogText", backlogText)
				.setParameter("entriesJson", entriesJson)
				.setParameter("createdAt", Timestamp.from(now.toInstant()))
				.setParameter("updatedAt", Timestamp.from(now.toInstant()))
				.getResultList();
			return rows.isEmpty() ? null : toRow(rows.getFirst());
		} catch (PersistenceException error) {
			throw error;
		}
	}

	private LifeOsDayRow toRow(Object row) {
		if (!(row instanceof Object[] values) || values.length < 10) {
			throw new IllegalStateException("life os row를 해석하지 못했습니다.");
		}
		return new LifeOsDayRow(
			((Number) values[0]).longValue(),
			(String) values[1],
			(UUID) values[2],
			(String) values[3],
			(String) values[4],
			(String) values[5],
			(String) values[6],
			parseEntries(values[7]),
			asOffsetDateTime(values[8]),
			asOffsetDateTime(values[9])
		);
	}

	private OffsetDateTime asOffsetDateTime(Object value) {
		if (value == null) return null;
		if (value instanceof OffsetDateTime offsetDateTime) return offsetDateTime;
		if (value instanceof Timestamp timestamp) return timestamp.toInstant().atOffset(ZoneOffset.UTC);
		if (value instanceof Instant instant) return instant.atOffset(ZoneOffset.UTC);
		if (value instanceof Date date) return date.toInstant().atOffset(ZoneOffset.UTC);
		if (value instanceof LocalDateTime localDateTime) return localDateTime.atOffset(ZoneOffset.UTC);
		if (value instanceof ZonedDateTime zonedDateTime) return zonedDateTime.toOffsetDateTime();
		return OffsetDateTime.parse(value.toString());
	}

	private List<LifeOsHourEntryDto> parseEntries(Object value) {
		if (value == null) return List.of();
		try {
			List<Map<String, Object>> rows = objectMapper.readValue(value.toString(), LIST_MAP_TYPE);
			List<LifeOsHourEntryDto> result = new ArrayList<>();
			for (Map<String, Object> row : rows) {
				result.add(new LifeOsHourEntryDto(
					((Number) row.getOrDefault("hour", 0)).intValue(),
					stringValue(row.get("goalText")),
					stringValue(row.get("actionText")),
					nullableStringValue(row.get("goalCategory")),
					nullableStringValue(row.get("actionCategory")),
					nullableStringValue(row.get("note"))
				));
			}
			return result;
		} catch (Exception error) {
			throw new IllegalStateException("life os entries json을 해석하지 못했습니다.", error);
		}
	}

	private String stringValue(Object value) {
		return value == null ? "" : String.valueOf(value);
	}

	private String nullableStringValue(Object value) {
		if (value == null) return null;
		String raw = String.valueOf(value);
		return raw;
	}
}
