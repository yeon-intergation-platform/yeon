package world.yeon.backend.member_field_values.write.service;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;

import world.yeon.backend.member_field_values.write.dto.BulkUpsertMemberFieldValuesRequest;
import world.yeon.backend.member_field_values.write.dto.MemberFieldValueMutationItemResponse;
import world.yeon.backend.member_field_values.write.dto.MemberFieldValuesMutationResponse;
import world.yeon.backend.member_field_values.write.repository.MemberFieldValueWriteRepository;

@Service
public class MemberFieldValueWriteService {

	private record ValueColumns(String valueText, String valueNumber, Boolean valueBoolean, String valueJson) {
	}

	private final MemberFieldValueWriteRepository repository;
	private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

	public MemberFieldValueWriteService(MemberFieldValueWriteRepository repository) {
		this.repository = repository;
	}

	@Transactional
	public MemberFieldValuesMutationResponse bulkUpsert(String spacePublicId, String memberPublicId, UUID userId, BulkUpsertMemberFieldValuesRequest request) {
		Long spaceInternalId = repository.findSpaceInternalId(spacePublicId);
		if (spaceInternalId == null) {
			throw new MemberFieldValueWriteServiceException(404, "스페이스를 찾지 못했습니다.", "SPACE_NOT_FOUND");
		}
		Long memberInternalId = repository.findMemberInternalId(memberPublicId, spaceInternalId);
		if (memberInternalId == null) {
			throw new MemberFieldValueWriteServiceException(404, "수강생을 찾지 못했습니다.", "MEMBER_NOT_FOUND");
		}

		List<String> uniqueDefinitionPublicIds = request.values().stream()
			.map(value -> value.fieldDefinitionId())
			.filter(id -> id != null && !id.isBlank())
			.collect(java.util.stream.Collectors.collectingAndThen(
				java.util.stream.Collectors.toCollection(LinkedHashSet::new),
				List::copyOf
			));

		var definitions = repository.findDefinitions(spaceInternalId, uniqueDefinitionPublicIds);
		Map<String, MemberFieldValueWriteRepository.DefinitionRow> definitionByPublicId = definitions.stream()
			.collect(java.util.stream.Collectors.toMap(
				MemberFieldValueWriteRepository.DefinitionRow::definitionPublicId,
				definition -> definition
			));

		for (String definitionPublicId : uniqueDefinitionPublicIds) {
			if (!definitionByPublicId.containsKey(definitionPublicId)) {
				throw new MemberFieldValueWriteServiceException(404, "필드 정의를 찾지 못했습니다.", "FIELD_DEFINITION_NOT_FOUND");
			}
		}

		for (var payload : request.values()) {
			if (payload.fieldDefinitionId() == null || payload.fieldDefinitionId().isBlank()) {
				throw new MemberFieldValueWriteServiceException(400, "필드 정의 ID가 필요합니다.", "INVALID_REQUEST");
			}
			var definition = definitionByPublicId.get(payload.fieldDefinitionId());
			if (definition == null) {
				throw new MemberFieldValueWriteServiceException(404, "필드 정의를 찾지 못했습니다.", "FIELD_DEFINITION_NOT_FOUND");
			}
			ValueColumns valueColumns = buildValueColumns(definition.fieldType(), payload.value());
			repository.upsertValue(
				generatePublicId(),
				memberInternalId,
				definition.definitionInternalId(),
				valueColumns.valueText(),
				valueColumns.valueNumber(),
				valueColumns.valueBoolean(),
				valueColumns.valueJson()
			);
		}

		List<Long> definitionInternalIds = uniqueDefinitionPublicIds.stream()
			.map(definitionByPublicId::get)
			.filter(java.util.Objects::nonNull)
			.map(MemberFieldValueWriteRepository.DefinitionRow::definitionInternalId)
			.toList();

		var values = repository.findValues(memberInternalId, spaceInternalId, definitionInternalIds)
			.stream()
			.map(value -> new MemberFieldValueMutationItemResponse(
				value.fieldDefinitionPublicId(),
				value.fieldType(),
				value.fieldName(),
				value.valueText(),
				value.valueNumber(),
				value.valueBoolean(),
				value.valueJson() == null ? null : objectMapper.convertValue(value.valueJson(), Object.class)
			))
			.toList();

		return MemberFieldValuesMutationResponse.success(values);
	}

	private ValueColumns buildValueColumns(String fieldType, Object value) {
		if (value == null) {
			return new ValueColumns(null, null, null, null);
		}
		return switch (fieldType) {
			case "text", "long_text", "url", "email", "phone", "date" ->
				new ValueColumns(String.valueOf(value).substring(0, Math.min(String.valueOf(value).length(), 5000)), null, null, null);
			case "number" -> {
				double numeric = toNumber(value);
				yield new ValueColumns(null, stripTrailingZero(numeric), null, null);
			}
			case "checkbox" -> new ValueColumns(null, null, Boolean.valueOf(String.valueOf(value)), null);
			case "select", "multi_select" -> new ValueColumns(null, null, null, writeJson(value));
			default -> new ValueColumns(String.valueOf(value), null, null, null);
		};
	}

	private double toNumber(Object value) {
		try {
			double numeric = value instanceof Number number ? number.doubleValue() : Double.parseDouble(String.valueOf(value));
			if (Double.isNaN(numeric)) throw new NumberFormatException();
			return numeric;
		} catch (Exception error) {
			throw new MemberFieldValueWriteServiceException(400, "숫자 필드에 유효하지 않은 값입니다: " + value, "INVALID_REQUEST");
		}
	}

	private String stripTrailingZero(double numeric) {
		java.math.BigDecimal decimal = java.math.BigDecimal.valueOf(numeric).stripTrailingZeros();
		return decimal.scale() < 0 ? decimal.setScale(0).toPlainString() : decimal.toPlainString();
	}

	private String writeJson(Object value) {
		try {
			return objectMapper.writeValueAsString(value);
		} catch (Exception error) {
			throw new MemberFieldValueWriteServiceException(400, "필드 값을 JSON으로 직렬화하지 못했습니다.", "INVALID_REQUEST");
		}
	}

	private String generatePublicId() {
		return "mfv_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
	}
}
