package world.yeon.backend.sheet_export.snapshot.repository;

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

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.persistence.EntityManager;

@Repository
public class SheetExportSnapshotRepository {

	public record IntegrationRow(
		Long integrationInternalId,
		Long spaceInternalId,
		OffsetDateTime lastSyncedAt
	) {
	}

	public record SnapshotRow(
		String memberId,
		JsonNode basePayload,
		String basePayloadHash,
		OffsetDateTime exportedAt
	) {
	}

	private final EntityManager entityManager;
	private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

	public SheetExportSnapshotRepository(EntityManager entityManager) {
		this.entityManager = entityManager;
	}

	public IntegrationRow findIntegration(String spacePublicId, String sheetId) {
		List<?> rows = entityManager.createNativeQuery("""
			select i.id, i.space_id, i.last_synced_at
			from public.sheet_integrations i
			inner join public.spaces s on s.id = i.space_id
			where s.public_id = :spacePublicId
			  and i.sheet_id = :sheetId
			  and i.data_type = 'export'
			limit 1
			""")
			.setParameter("spacePublicId", spacePublicId)
			.setParameter("sheetId", sheetId)
			.getResultList();
		if (rows.isEmpty()) return null;
		Object[] values = castRow(rows.getFirst(), 3, "sheet integration row");
		return new IntegrationRow(
			asLong(values[0]),
			asLong(values[1]),
			asOffsetDateTime(values[2])
		);
	}

	public List<SnapshotRow> findSnapshots(Long integrationInternalId) {
		List<?> rows = entityManager.createNativeQuery("""
			select member_id::text, base_payload::text, base_payload_hash, exported_at
			from public.sheet_integration_member_snapshots
			where integration_id = :integrationInternalId
			order by exported_at asc, member_id asc
			""")
			.setParameter("integrationInternalId", integrationInternalId)
			.getResultList();
		return rows.stream().map(this::toSnapshotRow).toList();
	}

	@Transactional
	public void replaceSnapshots(
		Long integrationInternalId,
		Long spaceInternalId,
		OffsetDateTime exportedAt,
		List<SnapshotReplaceRow> rows
	) {
		entityManager.createNativeQuery("""
			delete from public.sheet_integration_member_snapshots
			where integration_id = :integrationInternalId
			""")
			.setParameter("integrationInternalId", integrationInternalId)
			.executeUpdate();

		for (SnapshotReplaceRow row : rows) {
			entityManager.createNativeQuery("""
				insert into public.sheet_integration_member_snapshots
					(public_id, integration_id, space_id, member_id, base_payload, base_payload_hash, exported_at, created_at, updated_at)
				values
					(:publicId, :integrationInternalId, :spaceInternalId, :memberId, cast(:basePayload as jsonb), :basePayloadHash, :exportedAt, :exportedAt, :exportedAt)
				""")
				.setParameter("publicId", row.publicId())
				.setParameter("integrationInternalId", integrationInternalId)
				.setParameter("spaceInternalId", spaceInternalId)
				.setParameter("memberId", row.memberId())
				.setParameter("basePayload", row.basePayloadJson())
				.setParameter("basePayloadHash", row.basePayloadHash())
				.setParameter("exportedAt", Timestamp.from(exportedAt.toInstant()))
				.executeUpdate();
		}
	}

	@Transactional
	public void updateIntegrationLastSyncedAt(Long integrationInternalId, OffsetDateTime exportedAt) {
		entityManager.createNativeQuery("""
			update public.sheet_integrations
			set last_synced_at = :exportedAt,
			    updated_at = :exportedAt
			where id = :integrationInternalId
			""")
			.setParameter("integrationInternalId", integrationInternalId)
			.setParameter("exportedAt", Timestamp.from(exportedAt.toInstant()))
			.executeUpdate();
	}

	public record SnapshotReplaceRow(
		String publicId,
		String memberId,
		String basePayloadJson,
		String basePayloadHash
	) {
	}

	private SnapshotRow toSnapshotRow(Object row) {
		Object[] values = castRow(row, 4, "sheet snapshot row");
		return new SnapshotRow(
			(String) values[0],
			parseJson((String) values[1]),
			(String) values[2],
			asOffsetDateTime(values[3])
		);
	}

	private Object[] castRow(Object row, int minimumLength, String label) {
		if (!(row instanceof Object[] values) || values.length < minimumLength) {
			throw new IllegalStateException(label + "를 해석하지 못했습니다.");
		}
		return values;
	}

	private JsonNode parseJson(String raw) {
		if (raw == null) return null;
		try {
			return objectMapper.readTree(raw);
		} catch (Exception error) {
			throw new IllegalStateException("snapshot payload를 파싱하지 못했습니다.", error);
		}
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
