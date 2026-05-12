package world.yeon.backend.sheet_export.import_context.repository;

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

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.persistence.EntityManager;

@Repository
public class SheetExportImportContextRepository {

	public record IntegrationRow(Long integrationInternalId, Long spaceInternalId, OffsetDateTime lastSyncedAt) {}
	public record MemberRow(Long memberInternalId, String memberPublicId, String name, String email, String phone, String status, String initialRiskLevel) {}
	public record FieldDefinitionRow(Long fieldDefinitionInternalId, String fieldDefinitionPublicId, String name, String fieldType) {}
	public record ValueRow(Long memberInternalId, Long fieldDefinitionInternalId, String valueText, String valueNumber, Boolean valueBoolean, JsonNode valueJson) {}
	public record SnapshotRow(String memberId, JsonNode basePayload, String basePayloadHash, OffsetDateTime exportedAt) {}

	private final EntityManager entityManager;
	private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

	public SheetExportImportContextRepository(EntityManager entityManager) {
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
		return new IntegrationRow(asLong(values[0]), asLong(values[1]), asOffsetDateTime(values[2]));
	}

	public List<MemberRow> findMembers(Long spaceInternalId) {
		List<?> rows = entityManager.createNativeQuery("""
			select id, public_id, name, email, phone, status, initial_risk_level
			from public.members
			where space_id = :spaceInternalId
			order by created_at asc
			""")
			.setParameter("spaceInternalId", spaceInternalId)
			.getResultList();
		return rows.stream().map(this::toMemberRow).toList();
	}

	public List<FieldDefinitionRow> findFieldDefinitions(Long spaceInternalId) {
		List<?> rows = entityManager.createNativeQuery("""
			select field.id, field.public_id, field.name, field.field_type
			from public.member_field_definitions field
			inner join public.member_tab_definitions tab on field.tab_id = tab.id
			where field.space_id = :spaceInternalId
			  and field.deleted_at is null
			order by tab.display_order asc, field.display_order asc
			""")
			.setParameter("spaceInternalId", spaceInternalId)
			.getResultList();
		return rows.stream().map(this::toFieldDefinitionRow).toList();
	}

	public List<ValueRow> findValues(List<Long> memberInternalIds, List<Long> fieldDefinitionInternalIds) {
		if (memberInternalIds.isEmpty() || fieldDefinitionInternalIds.isEmpty()) return List.of();
		List<?> rows = entityManager.createNativeQuery("""
			select member_id, field_definition_id, value_text, value_number::text, value_boolean, value_json::text
			from public.member_field_values
			where member_id in (:memberInternalIds)
			  and field_definition_id in (:fieldDefinitionInternalIds)
			""")
			.setParameter("memberInternalIds", memberInternalIds)
			.setParameter("fieldDefinitionInternalIds", fieldDefinitionInternalIds)
			.getResultList();
		return rows.stream().map(this::toValueRow).toList();
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

	private MemberRow toMemberRow(Object row) {
		Object[] values = castRow(row, 7, "member row");
		return new MemberRow(asLong(values[0]), (String) values[1], (String) values[2], (String) values[3], (String) values[4], (String) values[5], (String) values[6]);
	}
	private FieldDefinitionRow toFieldDefinitionRow(Object row) {
		Object[] values = castRow(row, 4, "field definition row");
		return new FieldDefinitionRow(asLong(values[0]), (String) values[1], (String) values[2], (String) values[3]);
	}
	private ValueRow toValueRow(Object row) {
		Object[] values = castRow(row, 6, "field value row");
		return new ValueRow(asLong(values[0]), asLong(values[1]), (String) values[2], (String) values[3], (Boolean) values[4], parseJson((String) values[5]));
	}
	private SnapshotRow toSnapshotRow(Object row) {
		Object[] values = castRow(row, 4, "snapshot row");
		return new SnapshotRow((String) values[0], parseJson((String) values[1]), (String) values[2], asOffsetDateTime(values[3]));
	}
	private Object[] castRow(Object row, int minimumLength, String label) {
		if (!(row instanceof Object[] values) || values.length < minimumLength) throw new IllegalStateException(label + "를 해석하지 못했습니다.");
		return values;
	}
	private JsonNode parseJson(String raw) {
		if (raw == null) return null;
		try { return objectMapper.readTree(raw); } catch (Exception error) { throw new IllegalStateException("json을 파싱하지 못했습니다.", error); }
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
