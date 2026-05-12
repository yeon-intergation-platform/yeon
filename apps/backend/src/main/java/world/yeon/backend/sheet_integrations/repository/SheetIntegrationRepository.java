package world.yeon.backend.sheet_integrations.repository;

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
public class SheetIntegrationRepository {

	public record SheetIntegrationRow(
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

	public SheetIntegrationRepository(EntityManager entityManager) {
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

	public List<SheetIntegrationRow> findIntegrations(String spacePublicId) {
		return entityManager.createNativeQuery("""
			select i.id, i.space_id, i.public_id, i.sheet_url, i.sheet_id, i.data_type, i.column_mapping::text, i.last_synced_at, i.created_at, i.updated_at
			from public.sheet_integrations i
			inner join public.spaces s on s.id = i.space_id
			where s.public_id = :spacePublicId
			order by i.created_at asc, i.id asc
			""")
			.setParameter("spacePublicId", spacePublicId)
			.getResultList()
			.stream()
			.map(this::toRow)
			.toList();
	}

	public SheetIntegrationRow findIntegration(String spacePublicId, String integrationPublicId) {
		List<?> rows = entityManager.createNativeQuery("""
			select i.id, i.space_id, i.public_id, i.sheet_url, i.sheet_id, i.data_type, i.column_mapping::text, i.last_synced_at, i.created_at, i.updated_at
			from public.sheet_integrations i
			inner join public.spaces s on s.id = i.space_id
			where s.public_id = :spacePublicId
			  and i.public_id = :integrationPublicId
			limit 1
			""")
			.setParameter("spacePublicId", spacePublicId)
			.setParameter("integrationPublicId", integrationPublicId)
			.getResultList();
		if (rows.isEmpty()) return null;
		return toRow(rows.getFirst());
	}

	@Transactional
	public SheetIntegrationRow insertIntegration(Long spaceInternalId, String publicId, String sheetUrl, String sheetId, String dataType, String columnMappingJson, OffsetDateTime now) {
		List<?> rows = entityManager.createNativeQuery("""
			insert into public.sheet_integrations (
			  public_id, space_id, sheet_url, sheet_id, data_type, column_mapping, last_synced_at, created_at, updated_at
			) values (
			  :publicId, :spaceInternalId, :sheetUrl, :sheetId, :dataType, cast(:columnMappingJson as jsonb), null, :now, :now
			)
			returning id, space_id, public_id, sheet_url, sheet_id, data_type, column_mapping::text, last_synced_at, created_at, updated_at
			""")
			.setParameter("publicId", publicId)
			.setParameter("spaceInternalId", spaceInternalId)
			.setParameter("sheetUrl", sheetUrl)
			.setParameter("sheetId", sheetId)
			.setParameter("dataType", dataType)
			.setParameter("columnMappingJson", columnMappingJson)
			.setParameter("now", Timestamp.from(now.toInstant()))
			.getResultList();
		return rows.isEmpty() ? null : toRow(rows.getFirst());
	}

	public Long findMemberInternalIdByName(Long spaceInternalId, String memberName) {
		List<?> rows = entityManager.createNativeQuery("""
			select id
			from public.members
			where space_id = :spaceInternalId
			  and name = :memberName
			limit 1
			""")
			.setParameter("spaceInternalId", spaceInternalId)
			.setParameter("memberName", memberName)
			.getResultList();
		if (rows.isEmpty()) return null;
		return asLong(rows.getFirst());
	}

	public boolean existsActivityLog(Long memberInternalId, OffsetDateTime recordedAt, String type) {
		List<?> rows = entityManager.createNativeQuery("""
			select id
			from public.activity_logs
			where member_id = :memberInternalId
			  and recorded_at = :recordedAt
			  and type = :type
			limit 1
			""")
			.setParameter("memberInternalId", memberInternalId)
			.setParameter("recordedAt", Timestamp.from(recordedAt.toInstant()))
			.setParameter("type", type)
			.getResultList();
		return !rows.isEmpty();
	}

	@Transactional
	public void insertActivityLog(String publicId, Long memberInternalId, Long spaceInternalId, String type, String status, OffsetDateTime recordedAt, String source) {
		entityManager.createNativeQuery("""
			insert into public.activity_logs (
			  public_id, member_id, space_id, type, status, recorded_at, source, created_at
			) values (
			  :publicId, :memberInternalId, :spaceInternalId, :type, :status, :recordedAt, :source, now()
			)
			""")
			.setParameter("publicId", publicId)
			.setParameter("memberInternalId", memberInternalId)
			.setParameter("spaceInternalId", spaceInternalId)
			.setParameter("type", type)
			.setParameter("status", status)
			.setParameter("recordedAt", Timestamp.from(recordedAt.toInstant()))
			.setParameter("source", source)
			.executeUpdate();
	}

	@Transactional
	public void updateLastSyncedAt(Long integrationInternalId, OffsetDateTime now) {
		entityManager.createNativeQuery("""
			update public.sheet_integrations
			set last_synced_at = :now,
			    updated_at = :now
			where id = :integrationInternalId
			""")
			.setParameter("integrationInternalId", integrationInternalId)
			.setParameter("now", Timestamp.from(now.toInstant()))
			.executeUpdate();
	}

	private SheetIntegrationRow toRow(Object row) {
		if (!(row instanceof Object[] values) || values.length < 10) {
			throw new IllegalStateException("sheet integration row를 해석하지 못했습니다.");
		}
		return new SheetIntegrationRow(
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
