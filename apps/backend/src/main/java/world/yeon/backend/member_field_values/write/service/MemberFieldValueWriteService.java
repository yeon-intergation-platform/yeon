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
import world.yeon.backend.space_access.service.SpaceAccessService;

@Service
public class MemberFieldValueWriteService {

	private record ValueColumns(String valueText, String valueNumber, Boolean valueBoolean, String valueJson) {
	}

	private final MemberFieldValueWriteRepository repository;
	private final SpaceAccessService spaceAccessService;
	private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

	public MemberFieldValueWriteService(MemberFieldValueWriteRepository repository, SpaceAccessService spaceAccessService) {
		this.repository = repository;
		this.spaceAccessService = spaceAccessService;
	}

	@Transactional
	public MemberFieldValuesMutationResponse bulkUpsert(String spacePublicId, String memberPublicId, UUID userId, BulkUpsertMemberFieldValuesRequest request) {
		// IDOR 방지: 타인 스페이스/수강생의 필드 값을 수정하지 못하도록 소유권을 먼저 검증한다.
		try {
			spaceAccessService.requireOwnedSpace(spacePublicId, userId);
		} catch (java.util.NoSuchElementException notOwned) {
			throw new MemberFieldValueWriteServiceException(404, "스페이스를 찾지 못했습니다.", "SPACE_NOT_FOUND");
		}
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

		// 같은 정의가 중복으로 오면 multi-row ON CONFLICT 가 한 행을 두 번 갱신해 실패하므로,
		// 정의 internal ID 기준으로 마지막 값만 남기도록 LinkedHashMap 으로 dedupe 한다.
		java.util.LinkedHashMap<Long, MemberFieldValueWriteRepository.UpsertValueParams> upsertByDefinition = new java.util.LinkedHashMap<>();
		for (var payload : request.values()) {
			if (payload.fieldDefinitionId() == null || payload.fieldDefinitionId().isBlank()) {
				throw new MemberFieldValueWriteServiceException(400, "필드 정의 ID가 필요합니다.", "INVALID_REQUEST");
			}
			var definition = definitionByPublicId.get(payload.fieldDefinitionId());
			if (definition == null) {
				throw new MemberFieldValueWriteServiceException(404, "필드 정의를 찾지 못했습니다.", "FIELD_DEFINITION_NOT_FOUND");
			}
			ValueColumns valueColumns = buildValueColumns(definition.fieldType(), payload.value());
			upsertByDefinition.put(definition.definitionInternalId(), new MemberFieldValueWriteRepository.UpsertValueParams(
				generatePublicId(),
				memberInternalId,
				definition.definitionInternalId(),
				valueColumns.valueText(),
				valueColumns.valueNumber(),
				valueColumns.valueBoolean(),
				valueColumns.valueJson()
			));
		}
		// IDX 75/176: 필드 수만큼 개별 upsert 라운드트립 대신 단일 multi-row upsert 로 묶는다.
		repository.upsertValues(List.copyOf(upsertByDefinition.values()));

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
			case "date" -> new ValueColumns(normalizeDate(value), null, null, null);
			case "text", "long_text", "url", "email", "phone" ->
				new ValueColumns(requireWithinLength(String.valueOf(value)), null, null, null);
			case "number" -> {
				double numeric = toNumber(value);
				yield new ValueColumns(null, stripTrailingZero(numeric), null, null);
			}
			case "checkbox" -> new ValueColumns(null, null, parseBoolean(value), null);
			case "select", "multi_select" -> new ValueColumns(null, null, null, writeJson(value));
			default -> new ValueColumns(requireWithinLength(String.valueOf(value)), null, null, null);
		};
	}

	private double toNumber(Object value) {
		try {
			double numeric = value instanceof Number number ? number.doubleValue() : Double.parseDouble(String.valueOf(value));
			// IDX 78: NaN/Infinity/과대값은 numeric 컬럼 범위를 벗어나거나 BigDecimal 변환에서 실패하므로 거절한다.
			if (!Double.isFinite(numeric)) throw new NumberFormatException();
			return numeric;
		} catch (Exception error) {
			throw new MemberFieldValueWriteServiceException(400, "숫자 필드에 유효하지 않은 값입니다: " + value, "INVALID_REQUEST");
		}
	}

	// IDX 79: 5000자 초과 입력을 조용히 잘라 손실하지 않고 명시적으로 거절한다.
	private String requireWithinLength(String value) {
		if (value.length() > 5000) {
			throw new MemberFieldValueWriteServiceException(400, "텍스트 필드는 5000자를 초과할 수 없습니다.", "INVALID_REQUEST");
		}
		return value;
	}

	// IDX 77: date 타입에 최소한의 'YYYY-MM-DD' 형식 검증을 적용한다(형식 불일치 시 400).
	private String normalizeDate(Object value) {
		String raw = String.valueOf(value).trim();
		if (raw.isEmpty()) {
			return null;
		}
		try {
			java.time.LocalDate.parse(raw);
		} catch (java.time.format.DateTimeParseException error) {
			throw new MemberFieldValueWriteServiceException(400, "날짜 필드 형식이 올바르지 않습니다(YYYY-MM-DD).", "INVALID_REQUEST");
		}
		return raw;
	}

	// IDX 76: checkbox는 Boolean 우선, 문자열은 화이트리스트로만 파싱하고 그 외는 400으로 거절한다.
	private Boolean parseBoolean(Object value) {
		if (value instanceof Boolean bool) {
			return bool;
		}
		String raw = String.valueOf(value).trim().toLowerCase(java.util.Locale.ROOT);
		return switch (raw) {
			case "true", "1" -> Boolean.TRUE;
			case "false", "0" -> Boolean.FALSE;
			default -> throw new MemberFieldValueWriteServiceException(400, "체크박스 필드에 유효하지 않은 값입니다: " + value, "INVALID_REQUEST");
		};
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
