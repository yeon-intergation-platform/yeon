package world.yeon.backend.member_field_values.write.repository;

import java.math.BigInteger;
import java.util.List;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.persistence.EntityManager;

@Repository
public class MemberFieldValueWriteRepository {

	public record DefinitionRow(Long definitionInternalId, String definitionPublicId, String fieldType, String fieldName) {
	}

	public record ValueRow(
		String fieldDefinitionPublicId,
		String fieldType,
		String fieldName,
		String valueText,
		String valueNumber,
		Boolean valueBoolean,
		JsonNode valueJson
	) {
	}

	private final EntityManager entityManager;
	private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

	public MemberFieldValueWriteRepository(EntityManager entityManager) {
		this.entityManager = entityManager;
	}

	public Long findSpaceInternalId(String spacePublicId) {
		List<?> result = entityManager.createNativeQuery("""
			select id
			from public.spaces
			where public_id = :spacePublicId
			limit 1
			""")
			.setParameter("spacePublicId", spacePublicId)
			.getResultList();
		if (result.isEmpty()) return null;
		return asLong(result.getFirst());
	}

	public Long findMemberInternalId(String memberPublicId, Long spaceInternalId) {
		List<?> result = entityManager.createNativeQuery("""
			select id
			from public.members
			where public_id = :memberPublicId
			  and space_id = :spaceInternalId
			limit 1
			""")
			.setParameter("memberPublicId", memberPublicId)
			.setParameter("spaceInternalId", spaceInternalId)
			.getResultList();
		if (result.isEmpty()) return null;
		return asLong(result.getFirst());
	}

	public List<DefinitionRow> findDefinitions(Long spaceInternalId, List<String> definitionPublicIds) {
		if (definitionPublicIds.isEmpty()) return List.of();
		List<?> rows = entityManager.createNativeQuery("""
			select id, public_id, field_type, name
			from public.member_field_definitions
			where space_id = :spaceInternalId
			  and deleted_at is null
			  and public_id in (:definitionPublicIds)
			""")
			.setParameter("spaceInternalId", spaceInternalId)
			.setParameter("definitionPublicIds", definitionPublicIds)
			.getResultList();
		return rows.stream().map(this::toDefinitionRow).toList();
	}

	@Transactional
	public void upsertValue(
		String publicId,
		Long memberInternalId,
		Long definitionInternalId,
		String valueText,
		String valueNumber,
		Boolean valueBoolean,
		String valueJson
	) {
		entityManager.createNativeQuery("""
			insert into public.member_field_values (
			  public_id,
			  member_id,
			  field_definition_id,
			  value_text,
			  value_number,
			  value_boolean,
			  value_json,
			  created_at,
			  updated_at
			) values (
			  :publicId,
			  :memberInternalId,
			  :definitionInternalId,
			  :valueText,
			  cast(:valueNumber as numeric),
			  :valueBoolean,
			  cast(:valueJson as jsonb),
			  now(),
			  now()
			)
			on conflict (member_id, field_definition_id)
			do update set
			  value_text = excluded.value_text,
			  value_number = excluded.value_number,
			  value_boolean = excluded.value_boolean,
			  value_json = excluded.value_json,
			  updated_at = excluded.updated_at
			""")
			.setParameter("publicId", publicId)
			.setParameter("memberInternalId", memberInternalId)
			.setParameter("definitionInternalId", definitionInternalId)
			.setParameter("valueText", valueText)
			.setParameter("valueNumber", valueNumber)
			.setParameter("valueBoolean", valueBoolean)
			.setParameter("valueJson", valueJson)
			.executeUpdate();
	}

	public List<ValueRow> findValues(Long memberInternalId, Long spaceInternalId, List<Long> definitionInternalIds) {
		String baseSql = """
			select def.public_id, def.field_type, def.name,
			       val.value_text,
			       val.value_number::text,
			       val.value_boolean,
			       val.value_json::text
			from public.member_field_values val
			inner join public.member_field_definitions def
			  on def.id = val.field_definition_id
			where val.member_id = :memberInternalId
			  and def.space_id = :spaceInternalId
			  and def.deleted_at is null
			""";
		var query = entityManager.createNativeQuery(
			definitionInternalIds.isEmpty() ? baseSql + " order by def.display_order asc" : baseSql + " and val.field_definition_id in (:definitionInternalIds) order by def.display_order asc"
		)
			.setParameter("memberInternalId", memberInternalId)
			.setParameter("spaceInternalId", spaceInternalId);
		if (!definitionInternalIds.isEmpty()) {
			query.setParameter("definitionInternalIds", definitionInternalIds);
		}
		List<?> rows = query.getResultList();
		return rows.stream().map(this::toValueRow).toList();
	}

	private DefinitionRow toDefinitionRow(Object row) {
		if (!(row instanceof Object[] values) || values.length < 4) {
			throw new IllegalStateException("필드 정의 결과를 해석하지 못했습니다.");
		}
		return new DefinitionRow(asLong(values[0]), (String) values[1], (String) values[2], (String) values[3]);
	}

	private ValueRow toValueRow(Object row) {
		if (!(row instanceof Object[] values) || values.length < 7) {
			throw new IllegalStateException("필드 값 결과를 해석하지 못했습니다.");
		}
		return new ValueRow(
			(String) values[0],
			(String) values[1],
			(String) values[2],
			(String) values[3],
			(String) values[4],
			(Boolean) values[5],
			parseJson((String) values[6])
		);
	}

	private JsonNode parseJson(String raw) {
		if (raw == null) return null;
		try {
			return objectMapper.readTree(raw);
		} catch (Exception error) {
			throw new IllegalStateException("valueJson을 파싱하지 못했습니다.", error);
		}
	}

	private Long asLong(Object value) {
		if (value instanceof BigInteger bigInteger) return bigInteger.longValue();
		if (value instanceof Number number) return number.longValue();
		throw new IllegalStateException("ID를 숫자로 해석하지 못했습니다.");
	}
}
