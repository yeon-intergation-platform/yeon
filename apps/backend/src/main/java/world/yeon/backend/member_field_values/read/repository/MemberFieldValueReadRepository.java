package world.yeon.backend.member_field_values.read.repository;

import java.math.BigInteger;
import java.util.List;

import org.springframework.stereotype.Repository;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.persistence.EntityManager;

@Repository
public class MemberFieldValueReadRepository {

	public record TabLookup(Long tabInternalId, Long spaceInternalId) {
	}

	public record ValueRow(
		String fieldDefinitionPublicId,
		String valueText,
		String valueNumber,
		Boolean valueBoolean,
		JsonNode valueJson
	) {
	}

	public record DetailedValueRow(
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

	public MemberFieldValueReadRepository(EntityManager entityManager) {
		this.entityManager = entityManager;
	}

	public Long findSpaceInternalId(String spacePublicId) {
		List<?> result = entityManager.createNativeQuery(
			"""
				select id
				from public.spaces
				where public_id = :spacePublicId
				limit 1
				"""
		)
			.setParameter("spacePublicId", spacePublicId)
			.getResultList();
		if (result.isEmpty()) {
			return null;
		}
		return asLong(result.getFirst());
	}

	public TabLookup findTabLookup(String tabPublicId) {
		List<?> result = entityManager.createNativeQuery(
			"""
				select id, space_id
				from public.member_tab_definitions
				where public_id = :tabPublicId
				limit 1
				"""
		)
			.setParameter("tabPublicId", tabPublicId)
			.getResultList();
		if (result.isEmpty()) {
			return null;
		}
		Object row = result.getFirst();
		if (row instanceof Object[] values && values.length >= 2) {
			return new TabLookup(asLong(values[0]), asLong(values[1]));
		}
		throw new IllegalStateException("탭 lookup 결과를 해석하지 못했습니다.");
	}

	public Long findMemberInternalId(String memberPublicId, Long spaceInternalId) {
		List<?> result = entityManager.createNativeQuery(
			"""
				select id
				from public.members
				where public_id = :memberPublicId
				  and space_id = :spaceInternalId
				limit 1
				"""
		)
			.setParameter("memberPublicId", memberPublicId)
			.setParameter("spaceInternalId", spaceInternalId)
			.getResultList();
		if (result.isEmpty()) {
			return null;
		}
		return asLong(result.getFirst());
	}

	public List<Long> findFieldDefinitionIds(Long spaceInternalId, Long tabInternalId) {
		return entityManager.createQuery(
			"""
				select field.id
				from MemberFieldDefinitionEntity field
				where field.spaceId = :spaceInternalId
				  and field.tabId = :tabInternalId
				  and field.deletedAt is null
				order by field.displayOrder asc
				""",
			Long.class
		)
			.setParameter("spaceInternalId", spaceInternalId)
			.setParameter("tabInternalId", tabInternalId)
			.getResultList();
	}

	public List<ValueRow> findValues(Long memberInternalId, Long spaceInternalId, List<Long> fieldDefinitionIds) {
		if (fieldDefinitionIds.isEmpty()) {
			return List.of();
		}
		List<?> rows = entityManager.createNativeQuery(
			"""
				select def.public_id as field_definition_public_id,
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
				  and val.field_definition_id in (:fieldDefinitionIds)
				order by def.display_order asc
				"""
		)
			.setParameter("memberInternalId", memberInternalId)
			.setParameter("spaceInternalId", spaceInternalId)
			.setParameter("fieldDefinitionIds", fieldDefinitionIds)
			.getResultList();
		return rows.stream().map(this::toValueRow).toList();
	}

	public List<DetailedValueRow> findDetailedValues(Long memberInternalId, Long spaceInternalId, List<String> fieldDefinitionPublicIds) {
		String baseSql = """
			select def.public_id,
			       def.field_type,
			       def.name,
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
			fieldDefinitionPublicIds.isEmpty()
				? baseSql + " order by def.display_order asc"
				: baseSql + " and def.public_id in (:fieldDefinitionPublicIds) order by def.display_order asc"
		)
			.setParameter("memberInternalId", memberInternalId)
			.setParameter("spaceInternalId", spaceInternalId);
		if (!fieldDefinitionPublicIds.isEmpty()) {
			query.setParameter("fieldDefinitionPublicIds", fieldDefinitionPublicIds);
		}
		List<?> rows = query.getResultList();
		return rows.stream().map(this::toDetailedValueRow).toList();
	}

	private ValueRow toValueRow(Object row) {
		if (!(row instanceof Object[] values) || values.length < 5) {
			throw new IllegalStateException("필드 값 조회 결과를 해석하지 못했습니다.");
		}
		return new ValueRow(
			(String) values[0],
			(String) values[1],
			(String) values[2],
			(Boolean) values[3],
			parseJson((String) values[4])
		);
	}

	private DetailedValueRow toDetailedValueRow(Object row) {
		if (!(row instanceof Object[] values) || values.length < 7) {
			throw new IllegalStateException("필드 값 상세 조회 결과를 해석하지 못했습니다.");
		}
		return new DetailedValueRow(
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
		if (raw == null) {
			return null;
		}
		try {
			return objectMapper.readTree(raw);
		} catch (Exception error) {
			throw new IllegalStateException("valueJson을 파싱하지 못했습니다.", error);
		}
	}

	private Long asLong(Object value) {
		if (value instanceof BigInteger bigInteger) {
			return bigInteger.longValue();
		}
		if (value instanceof Number number) {
			return number.longValue();
		}
		throw new IllegalStateException("ID를 숫자로 해석하지 못했습니다.");
	}
}
