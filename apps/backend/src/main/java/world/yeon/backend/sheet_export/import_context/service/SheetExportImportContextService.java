package world.yeon.backend.sheet_export.import_context.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import world.yeon.backend.sheet_export.import_context.dto.SheetExportImportContextFieldDefinitionResponse;
import world.yeon.backend.sheet_export.import_context.dto.SheetExportImportContextMemberResponse;
import world.yeon.backend.sheet_export.import_context.dto.SheetExportImportContextResponse;
import world.yeon.backend.sheet_export.import_context.repository.SheetExportImportContextRepository;
import world.yeon.backend.sheet_export.read.dto.SheetExportPayloadCoreResponse;
import world.yeon.backend.sheet_export.read.dto.SheetExportPayloadResponse;
import world.yeon.backend.sheet_export.snapshot.dto.SheetExportSnapshotItemResponse;

@Service
public class SheetExportImportContextService {

	private final SheetExportImportContextRepository repository;
	private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

	public SheetExportImportContextService(SheetExportImportContextRepository repository) {
		this.repository = repository;
	}

	public SheetExportImportContextResponse getContext(String spaceId, String sheetId) {
		var integration = repository.findIntegration(spaceId, sheetId);
		if (integration == null) {
			throw new NoSuchElementException("연동된 익스포트 시트를 찾지 못했습니다.");
		}
		var members = repository.findMembers(integration.spaceInternalId());
		var fields = repository.findFieldDefinitions(integration.spaceInternalId());
		var values = repository.findValues(
			members.stream().map(SheetExportImportContextRepository.MemberRow::memberInternalId).toList(),
			fields.stream().map(SheetExportImportContextRepository.FieldDefinitionRow::fieldDefinitionInternalId).toList()
		);
		var snapshots = repository.findSnapshots(integration.integrationInternalId()).stream()
			.map(row -> new SheetExportSnapshotItemResponse(
				row.memberId(),
				objectMapper.convertValue(row.basePayload(), SheetExportPayloadResponse.class),
				row.basePayloadHash(),
				row.exportedAt()
			)).toList();

		Map<String, SheetExportImportContextRepository.ValueRow> valueIndex = new LinkedHashMap<>();
		for (var value : values) {
			valueIndex.put(indexKey(value.memberInternalId(), value.fieldDefinitionInternalId()), value);
		}

		var fieldResponses = fields.stream()
			.map(field -> new SheetExportImportContextFieldDefinitionResponse(field.fieldDefinitionPublicId(), field.name(), field.fieldType()))
			.toList();
		var memberResponses = members.stream().map(member -> {
			Map<String, String> customFields = new LinkedHashMap<>();
			for (var field : fields) {
				var value = valueIndex.get(indexKey(member.memberInternalId(), field.fieldDefinitionInternalId()));
				customFields.put(field.name(), value == null ? null : formatFieldValue(field.fieldType(), value));
			}
			var payload = new SheetExportPayloadResponse(
				new SheetExportPayloadCoreResponse(
					normalizeText(member.name()),
					normalizeText(member.email()),
					normalizeText(member.phone()),
					normalizeText(member.status()),
					normalizeText(member.initialRiskLevel())
				),
				customFields
			);
			return new SheetExportImportContextMemberResponse(
				member.memberPublicId(),
				member.name(),
				member.email(),
				member.phone(),
				member.status(),
				member.initialRiskLevel(),
				payload
			);
		}).toList();

		return new SheetExportImportContextResponse(integration.lastSyncedAt(), fieldResponses, memberResponses, snapshots);
	}

	private String formatFieldValue(String fieldType, SheetExportImportContextRepository.ValueRow row) {
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
	private String indexKey(Long memberInternalId, Long fieldDefinitionInternalId) {
		return memberInternalId + ":" + fieldDefinitionInternalId;
	}
}
