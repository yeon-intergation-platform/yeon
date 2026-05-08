package world.yeon.backend.sheet_export.read.service;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;

import world.yeon.backend.sheet_export.read.dto.SheetExportFieldDefinitionResponse;
import world.yeon.backend.sheet_export.read.dto.SheetExportPayloadCoreResponse;
import world.yeon.backend.sheet_export.read.dto.SheetExportPayloadResponse;
import world.yeon.backend.sheet_export.read.dto.SheetExportRowResponse;
import world.yeon.backend.sheet_export.read.dto.SheetExportRowsResponse;
import world.yeon.backend.sheet_export.read.repository.SheetExportReadRepository;

@Service
@Profile("jdbc")
public class SheetExportReadService {

	private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

	private static final Map<String, String> STATUS_LABEL = Map.of(
		"active", "수강중",
		"withdrawn", "중도포기",
		"graduated", "수료"
	);

	private static final Map<String, String> RISK_LABEL = Map.of(
		"low", "낮음",
		"medium", "보통",
		"high", "높음"
	);

	private final SheetExportReadRepository repository;

	public SheetExportReadService(SheetExportReadRepository repository) {
		this.repository = repository;
	}

	public SheetExportRowsResponse getRows(String spacePublicId) {
		Long spaceInternalId = repository.findSpaceInternalId(spacePublicId);
		if (spaceInternalId == null) {
			throw new NoSuchElementException("스페이스를 찾지 못했습니다.");
		}

		var members = repository.findMembers(spaceInternalId);
		var fieldDefinitions = repository.findFieldDefinitions(spaceInternalId);
		var values = repository.findValues(
			members.stream().map(SheetExportReadRepository.MemberRow::memberInternalId).toList(),
			fieldDefinitions.stream().map(SheetExportReadRepository.FieldDefinitionRow::fieldDefinitionInternalId).toList()
		);

		Map<String, SheetExportReadRepository.ValueRow> valueIndex = new LinkedHashMap<>();
		for (var value : values) {
			valueIndex.put(indexKey(value.memberInternalId(), value.fieldDefinitionInternalId()), value);
		}

		var fieldDefinitionResponses = fieldDefinitions.stream()
			.map(field -> new SheetExportFieldDefinitionResponse(
				field.fieldDefinitionPublicId(),
				field.name(),
				field.fieldType()
			))
			.toList();

		var rowResponses = members.stream().map(member -> toRowResponse(member, fieldDefinitions, valueIndex)).toList();
		return new SheetExportRowsResponse(fieldDefinitionResponses, rowResponses);
	}

	private SheetExportRowResponse toRowResponse(
		SheetExportReadRepository.MemberRow member,
		List<SheetExportReadRepository.FieldDefinitionRow> fieldDefinitions,
		Map<String, SheetExportReadRepository.ValueRow> valueIndex
	) {
		Map<String, String> customFields = new LinkedHashMap<>();
		for (var field : fieldDefinitions) {
			var value = valueIndex.get(indexKey(member.memberInternalId(), field.fieldDefinitionInternalId()));
			customFields.put(field.name(), value == null ? null : formatFieldValue(field.fieldType(), value));
		}

		var payloadCore = new SheetExportPayloadCoreResponse(
			member.name(),
			normalizeText(member.email()),
			normalizeText(member.phone()),
			normalizeText(member.status()),
			normalizeText(member.initialRiskLevel())
		);
		var payload = new SheetExportPayloadResponse(payloadCore, customFields);

		var values = new java.util.ArrayList<String>();
		values.add(member.name());
		values.add(nullToEmpty(member.email()));
		values.add(nullToEmpty(member.phone()));
		values.add(STATUS_LABEL.getOrDefault(member.status(), nullToEmpty(member.status())));
		values.add(member.initialRiskLevel() == null ? "" : RISK_LABEL.getOrDefault(member.initialRiskLevel(), member.initialRiskLevel()));
		values.add(formatDate(member.createdAt()));
		for (var field : fieldDefinitions) {
			values.add(nullToEmpty(customFields.get(field.name())));
		}

		return new SheetExportRowResponse(member.memberPublicId(), List.copyOf(values), payload);
	}

	private String formatFieldValue(String fieldType, SheetExportReadRepository.ValueRow row) {
		return switch (fieldType) {
			case "number" -> row.valueNumber() == null ? "" : row.valueNumber();
			case "checkbox" -> row.valueBoolean() == null ? "" : (row.valueBoolean() ? "예" : "아니오");
			case "select" -> formatSelectValue(row.valueJson());
			case "multi_select" -> formatMultiSelectValue(row.valueJson());
			default -> row.valueText() == null ? "" : row.valueText();
		};
	}

	private String formatSelectValue(JsonNode valueJson) {
		if (valueJson == null || valueJson.isNull()) return "";
		if (valueJson.isTextual()) return valueJson.asText();
		if (valueJson.isArray()) {
			if (valueJson.isEmpty()) return "";
			JsonNode first = valueJson.get(0);
			return first == null || first.isNull() ? "" : (first.isTextual() ? first.asText() : first.toString());
		}
		return valueJson.toString();
	}

	private String formatMultiSelectValue(JsonNode valueJson) {
		if (valueJson == null || valueJson.isNull()) return "";
		if (valueJson.isArray()) {
			var parts = new java.util.ArrayList<String>();
			valueJson.forEach(item -> parts.add(item.isTextual() ? item.asText() : item.toString()));
			return String.join(", ", parts);
		}
		return valueJson.toString();
	}

	private String normalizeText(String value) {
		if (value == null) return null;
		String normalized = value.trim();
		return normalized.isEmpty() ? null : normalized;
	}

	private String nullToEmpty(String value) {
		return value == null ? "" : value;
	}

	private String formatDate(OffsetDateTime createdAt) {
		return createdAt == null ? "" : DATE_FORMATTER.format(createdAt);
	}

	private String indexKey(Long memberInternalId, Long fieldDefinitionInternalId) {
		return memberInternalId + ":" + fieldDefinitionInternalId;
	}
}
