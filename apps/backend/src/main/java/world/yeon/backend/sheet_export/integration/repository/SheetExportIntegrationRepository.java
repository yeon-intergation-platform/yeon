package world.yeon.backend.sheet_export.integration.repository;

import java.math.BigInteger;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.List;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;

@Repository
public class SheetExportIntegrationRepository {

	public record IntegrationRow(
		Long integrationInternalId,
		Long spaceInternalId,
		String publicId,
		String sheetUrl,
		String sheetId,
		String dataType,
		String columnMapping,
		OffsetDateTime lastSyncedAt,
		OffsetDateTime createdAt,
		OffsetDateTime updatedAt
	) {}

	private final EntityManager entityManager;

	public SheetExportIntegrationRepository(EntityManager entityManager) {
		this.entityManager = entityManager;
	}

	public Long findSpaceInternalId(String spacePublicId) {
		List<?> rows = entityManager.createNativeQuery("""
			select id
			from public.spaces
			where public_id = :spacePublicId
			limit 1
			""")
			.setParameter("spacePublicId", spacePublicId)
			.getResultList();
		if (rows.isEmpty()) return null;
		return asLong(rows.getFirst());
	}

	public IntegrationRow findExportIntegration(String spacePublicId) {
		List<?> rows = entityManager.createNativeQuery("""
			select i.id, i.space_id, i.public_id, i.sheet_url, i.sheet_id, i.data_type, i.column_mapping::text, i.last_synced_at, i.created_at, i.updated_at
			from public.sheet_integrations i
			inner join public.spaces s on s.id = i.space_id
			where s.public_id = :spacePublicId
			  and i.data_type = 'export'
			limit 1
			""")
			.setParameter("spacePublicId", spacePublicId)
			.getResultList();
		if (rows.isEmpty()) return null;
		return toRow(rows.getFirst());
	}

	@Transactional
	public IntegrationRow insertExportIntegration(Long spaceInternalId, String publicId, String sheetUrl, String sheetId, OffsetDateTime now) {
		List<?> rows = entityManager.createNativeQuery("""
			insert into public.sheet_integrations (
			  public_id, space_id, sheet_url, sheet_id, data_type, column_mapping, last_synced_at, created_at, updated_at
			) values (
			  :publicId, :spaceInternalId, :sheetUrl, :sheetId, 'export', null, null, :now, :now
			)
			returning id, space_id, public_id, sheet_url, sheet_id, data_type, column_mapping::text, last_synced_at, created_at, updated_at
			""")
			.setParameter("publicId", publicId)
			.setParameter("spaceInternalId", spaceInternalId)
			.setParameter("sheetUrl", sheetUrl)
			.setParameter("sheetId", sheetId)
			.setParameter("now", Timestamp.from(now.toInstant()))
			.getResultList();
		return rows.isEmpty() ? null : toRow(rows.getFirst());
	}

	@Transactional
	public IntegrationRow updateExportIntegration(Long integrationInternalId, String sheetUrl, String sheetId, OffsetDateTime now) {
		List<?> rows = entityManager.createNativeQuery("""
			update public.sheet_integrations
			set sheet_url = :sheetUrl,
			    sheet_id = :sheetId,
			    last_synced_at = null,
			    updated_at = :now
			where id = :integrationInternalId
			returning id, space_id, public_id, sheet_url, sheet_id, data_type, column_mapping::text, last_synced_at, created_at, updated_at
			""")
			.setParameter("integrationInternalId", integrationInternalId)
			.setParameter("sheetUrl", sheetUrl)
			.setParameter("sheetId", sheetId)
			.setParameter("now", Timestamp.from(now.toInstant()))
			.getResultList();
		return rows.isEmpty() ? null : toRow(rows.getFirst());
	}

	@Transactional
	public void deleteExportIntegration(Long spaceInternalId) {
		entityManager.createNativeQuery("""
			delete from public.sheet_integrations
			where space_id = :spaceInternalId
			  and data_type = 'export'
			""")
			.setParameter("spaceInternalId", spaceInternalId)
			.executeUpdate();
	}

	private IntegrationRow toRow(Object row) {
		if (!(row instanceof Object[] values) || values.length < 10) {
			throw new IllegalStateException("sheet export integration row를 해석하지 못했습니다.");
		}
		return new IntegrationRow(
			asLong(values[0]),
			asLong(values[1]),
			(String) values[2],
			(String) values[3],
			(String) values[4],
			(String) values[5],
			(String) values[6],
			asOffsetDateTime(values[7]),
			asOffsetDateTime(values[8]),
			asOffsetDateTime(values[9])
		);
	}

	private Long asLong(Object value) {
		if (value instanceof BigInteger bigInteger) return bigInteger.longValue();
		if (value instanceof Number number) return number.longValue();
		throw new IllegalStateException("ID를 숫자로 해석하지 못했습니다.");
	}

	private OffsetDateTime asOffsetDateTime(Object value) {
		if (value == null) return null;
		if (value instanceof OffsetDateTime offsetDateTime) return offsetDateTime;
		if (value instanceof ZonedDateTime zonedDateTime) return zonedDateTime.toOffsetDateTime();
		if (value instanceof Instant instant) return instant.atZone(ZoneId.systemDefault()).toOffsetDateTime();
		if (value instanceof LocalDateTime localDateTime) return localDateTime.atZone(ZoneId.systemDefault()).toOffsetDateTime();
		if (value instanceof Timestamp timestamp) return timestamp.toInstant().atZone(ZoneId.systemDefault()).toOffsetDateTime();
		if (value instanceof Date date) return date.toInstant().atZone(ZoneId.systemDefault()).toOffsetDateTime();
		throw new IllegalStateException("일시 값을 해석하지 못했습니다. 타입=" + value.getClass().getName());
	}
}
