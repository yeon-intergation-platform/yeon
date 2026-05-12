package world.yeon.backend.sheet_export.import_evaluation.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import world.yeon.backend.sheet_export.import_context.dto.SheetExportImportContextFieldDefinitionResponse;
import world.yeon.backend.sheet_export.import_context.dto.SheetExportImportContextMemberResponse;
import world.yeon.backend.sheet_export.import_context.dto.SheetExportImportContextResponse;
import world.yeon.backend.sheet_export.import_context.service.SheetExportImportContextService;
import world.yeon.backend.sheet_export.import_evaluation.dto.SheetExportImportConflictResponse;
import world.yeon.backend.sheet_export.import_evaluation.dto.SheetExportImportEvaluationRequest;
import world.yeon.backend.sheet_export.import_evaluation.dto.SheetExportImportEvaluationResponse;
import world.yeon.backend.sheet_export.import_evaluation.dto.SheetExportImportPlannedMutationResponse;
import world.yeon.backend.sheet_export.import_evaluation.dto.SheetExportImportPlannedValueResponse;
import world.yeon.backend.sheet_export.import_evaluation.dto.SheetExportImportSummaryResponse;
import world.yeon.backend.sheet_export.read.dto.SheetExportPayloadCoreResponse;
import world.yeon.backend.sheet_export.read.dto.SheetExportPayloadResponse;
import world.yeon.backend.sheet_export.snapshot.dto.SheetExportSnapshotItemResponse;

@Service
public class SheetExportImportEvaluationService {

	private static final String MEMBER_ID_COLUMN = "__yeon_member_id";
	private static final Map<String, String> STATUS_CODE_BY_LABEL = Map.ofEntries(
		Map.entry("수강중", "active"), Map.entry("active", "active"),
		Map.entry("중도포기", "withdrawn"), Map.entry("withdrawn", "withdrawn"),
		Map.entry("수료", "graduated"), Map.entry("graduated", "graduated")
	);
	private static final Map<String, String> RISK_CODE_BY_LABEL = Map.ofEntries(
		Map.entry("낮음", "low"), Map.entry("low", "low"),
		Map.entry("보통", "medium"), Map.entry("medium", "medium"),
		Map.entry("높음", "high"), Map.entry("high", "high")
	);

	private final SheetExportImportContextService importContextService;
	private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

	public SheetExportImportEvaluationService(SheetExportImportContextService importContextService) {
		this.importContextService = importContextService;
	}

	public SheetExportImportEvaluationResponse evaluate(String spaceId, SheetExportImportEvaluationRequest request) {
		var context = importContextService.getContext(spaceId, request.sheetId());
		var summary = new MutableSummary();
		List<List<String>> rows = request.rows() == null ? List.of() : request.rows();
		if (rows.isEmpty()) {
			return blocked(context, summary.withConflict(), List.of(conflict(
				"metadata_missing", null, null, null, "연동된 시트가 비어 있습니다. 먼저 시트에 최신 상태를 다시 반영해 주세요.", null, null, null, List.of()
			)));
		}

		List<String> headerRow = rows.getFirst();
		List<List<String>> dataRows = rows.subList(1, rows.size());
		List<String> normalizedHeaders = headerRow.stream().map(this::normalizeHeader).toList();
		Map<String, Integer> headerIndex = new LinkedHashMap<>();
		for (int i = 0; i < normalizedHeaders.size(); i += 1) headerIndex.put(normalizedHeaders.get(i), i);
		Integer nameIndex = headerIndex.get("이름");
		if (nameIndex == null) throw new IllegalArgumentException("연동된 시트에 '이름' 컬럼이 없습니다.");
		Integer emailIndex = headerIndex.get("이메일");
		Integer phoneIndex = headerIndex.get("전화번호");
		Integer statusIndex = headerIndex.containsKey("수강 상태") ? headerIndex.get("수강 상태") : headerIndex.get("상태");
		Integer riskIndex = headerIndex.get("위험도");
		Integer memberIdIndex = headerIndex.get(MEMBER_ID_COLUMN);
		if (memberIdIndex == null) {
			return blocked(context, summary.withConflict(), List.of(conflict(
				"metadata_missing", null, null, null, "충돌 없이 가져오려면 먼저 시트에 최신 상태를 한 번 반영해야 합니다.", null, null, null, List.of()
			)));
		}

		Map<String, SheetExportImportContextFieldDefinitionResponse> definitionByName = new LinkedHashMap<>();
		for (var definition : context.fieldDefinitions()) definitionByName.put(definition.name().trim(), definition);
		Map<String, SheetExportImportContextMemberResponse> memberById = new LinkedHashMap<>();
		for (var member : context.members()) memberById.put(member.memberId(), member);
		Map<String, SheetExportSnapshotItemResponse> snapshotByMemberId = new LinkedHashMap<>();
		for (var snapshot : context.snapshots()) snapshotByMemberId.put(snapshot.memberId(), snapshot);
		Map<String, SheetExportImportContextMemberResponse> memberIndex = new LinkedHashMap<>();
		for (var member : context.members()) {
			String emailKey = buildMemberLookupKey(member.email(), null, null);
			String phoneKey = buildMemberLookupKey(null, member.phone(), null);
			String nameKey = buildMemberLookupKey(null, null, member.name());
			if (emailKey != null) memberIndex.put(emailKey, member);
			if (phoneKey != null) memberIndex.put(phoneKey, member);
			if (nameKey != null) memberIndex.put(nameKey, member);
		}

		List<SheetExportImportConflictResponse> conflicts = new ArrayList<>();
		Set<String> seenManagedMemberIds = new LinkedHashSet<>();
		List<SheetExportImportPlannedMutationResponse> plannedCreates = new ArrayList<>();
		List<SheetExportImportPlannedMutationResponse> plannedUpdates = new ArrayList<>();

		for (int rowIndex = 0; rowIndex < dataRows.size(); rowIndex += 1) {
			List<String> row = dataRows.get(rowIndex);
			int rowNumber = rowIndex + 2;
			String name = cell(row, nameIndex).trim();
			String email = emailIndex == null ? null : normalizeTextValue(cell(row, emailIndex));
			String phone = phoneIndex == null ? null : normalizeTextValue(cell(row, phoneIndex));
			String managedMemberId = normalizeTextValue(cell(row, memberIdIndex));
			if (name.isBlank()) { summary.skipped += 1; continue; }

			List<SheetExportImportPlannedValueResponse> customValues = new ArrayList<>();
			for (int i = 0; i < normalizedHeaders.size(); i += 1) {
				var definition = definitionByName.get(normalizedHeaders.get(i));
				if (definition == null) continue;
				customValues.add(new SheetExportImportPlannedValueResponse(definition.id(), normalizeTextValue(cell(row, i))));
			}
			SheetExportPayloadResponse sheetPayload = buildCanonicalPayload(
				name,
				email,
				phone,
				statusIndex == null ? null : parseStatusCode(cell(row, statusIndex)),
				riskIndex == null ? null : parseRiskCode(cell(row, riskIndex)),
				customFieldMap(customValues, context.fieldDefinitions())
			);

			if (managedMemberId != null) {
				if (seenManagedMemberIds.contains(managedMemberId)) {
					conflicts.add(conflict("duplicate_member_row", rowNumber, managedMemberId, name, "같은 수강생 메타데이터를 가진 row가 시트에 두 번 이상 있습니다.", null, sheetPayload, null, List.of()));
					continue;
				}
				seenManagedMemberIds.add(managedMemberId);
				var snapshot = snapshotByMemberId.get(managedMemberId);
				if (snapshot == null) {
					conflicts.add(conflict("unknown_managed_row", rowNumber, managedMemberId, name, "서버에 기준 스냅샷이 없는 row입니다. 먼저 시트에 최신 상태를 다시 반영해 주세요.", null, sheetPayload, null, List.of()));
					continue;
				}
				var serverPayload = memberById.get(managedMemberId) == null ? null : memberById.get(managedMemberId).payload();
				var basePayload = snapshot.basePayload();
				if (serverPayload == null) {
					conflicts.add(conflict("deleted_on_server", rowNumber, managedMemberId, basePayload.core().name(), "서버에서 이미 삭제되거나 사라진 수강생 row입니다. 자동으로 다시 만들지 않고 충돌로 처리합니다.", basePayload, sheetPayload, null, List.of()));
					continue;
				}
				String baseHash = snapshot.basePayloadHash();
				String serverHash = hashPayload(serverPayload);
				String sheetHash = hashPayload(sheetPayload);
				boolean serverChanged = !serverHash.equals(baseHash);
				boolean sheetChanged = !sheetHash.equals(baseHash);
				if (!serverChanged && !sheetChanged) { summary.unchanged += 1; continue; }
				if (!serverChanged && sheetChanged) { plannedUpdates.add(new SheetExportImportPlannedMutationResponse(managedMemberId, sheetPayload, customValues)); continue; }
				if (serverChanged && !sheetChanged) { summary.unchanged += 1; continue; }
				if (serverHash.equals(sheetHash)) { summary.unchanged += 1; continue; }
				List<String> changedFields = new ArrayList<>(new LinkedHashSet<>());
				changedFields.addAll(diffPayloadFields(basePayload, serverPayload));
				changedFields.addAll(diffPayloadFields(basePayload, sheetPayload));
				conflicts.add(conflict("both_sides_changed", rowNumber, managedMemberId, serverPayload.core().name(), "서버와 시트가 모두 수정되어 자동 반영할 수 없습니다. 한쪽 값을 정리한 뒤 다시 시도해 주세요.", basePayload, sheetPayload, serverPayload, changedFields));
				continue;
			}

			String lookupKey = buildMemberLookupKey(email, phone, name);
			var matchedExistingMember = lookupKey == null ? null : memberIndex.get(lookupKey);
			if (matchedExistingMember != null) {
				SheetExportPayloadResponse basePayload = memberById.get(matchedExistingMember.memberId()) == null
					? buildCanonicalPayload(matchedExistingMember.name(), null, null, null, null, Map.of())
					: memberById.get(matchedExistingMember.memberId()).payload();
				conflicts.add(conflict("new_row_matches_existing_member", rowNumber, matchedExistingMember.memberId(), matchedExistingMember.name(), "메타데이터가 없는 신규 row가 기존 수강생과 겹칩니다. 먼저 시트를 최신 상태로 다시 내보내 주세요.", null, sheetPayload, matchedExistingMember.payload(), diffPayloadFields(basePayload, sheetPayload)));
				continue;
			}
			plannedCreates.add(new SheetExportImportPlannedMutationResponse(null, sheetPayload, customValues));
		}

		for (var snapshot : context.snapshots()) {
			if (memberById.containsKey(snapshot.memberId()) && !seenManagedMemberIds.contains(snapshot.memberId())) {
				conflicts.add(conflict("deleted_in_sheet", null, snapshot.memberId(), snapshot.basePayload().core().name(), "서버에는 아직 남아 있지만 시트에서 사라진 수강생입니다. 자동 삭제하지 않고 충돌로 처리합니다.", snapshot.basePayload(), null, memberById.get(snapshot.memberId()).payload(), List.of()));
			}
		}

		if (!conflicts.isEmpty()) {
			summary.conflicts = conflicts.size();
			return blocked(context, summary, conflicts);
		}
		summary.created = plannedCreates.size();
		summary.updated = plannedUpdates.size();
		return new SheetExportImportEvaluationResponse(
			"applied",
			summary.toResponse(),
			List.of(),
			context.lastSyncedAt(),
			plannedCreates,
			plannedUpdates
		);
	}

	private SheetExportImportEvaluationResponse blocked(SheetExportImportContextResponse context, MutableSummary summary, List<SheetExportImportConflictResponse> conflicts) {
		return new SheetExportImportEvaluationResponse("blocked", summary.toResponse(), conflicts, context.lastSyncedAt(), List.of(), List.of());
	}
	private SheetExportImportConflictResponse conflict(String type, Integer rowNumber, String memberId, String memberName, String message, SheetExportPayloadResponse base, SheetExportPayloadResponse sheet, SheetExportPayloadResponse server, List<String> changedFields) {
		return new SheetExportImportConflictResponse(type, rowNumber, memberId, memberName, changedFields, message, base, sheet, server);
	}
	private String normalizeHeader(String value) { return value == null ? "" : value.trim(); }
	private String normalizeTextValue(String value) { return value == null || value.trim().isEmpty() ? null : value.trim(); }
	private String cell(List<String> row, Integer index) { return index == null || index >= row.size() || row.get(index) == null ? "" : row.get(index); }
	private String parseStatusCode(String raw) { return raw == null ? null : STATUS_CODE_BY_LABEL.getOrDefault(raw.trim(), null); }
	private String parseRiskCode(String raw) { return raw == null ? null : RISK_CODE_BY_LABEL.getOrDefault(raw.trim(), null); }
	private String buildMemberLookupKey(String email, String phone, String name) {
		if (email != null && !email.trim().isEmpty()) return "email:" + email.trim().toLowerCase();
		if (phone != null && !phone.trim().isEmpty()) return "phone:" + phone.trim();
		if (name != null && !name.trim().isEmpty()) return "name:" + name.trim();
		return null;
	}
	private Map<String, String> customFieldMap(List<SheetExportImportPlannedValueResponse> customValues, List<SheetExportImportContextFieldDefinitionResponse> definitions) {
		Map<String, String> result = new LinkedHashMap<>();
		for (var value : customValues) {
			String name = definitions.stream().filter(def -> def.id().equals(value.fieldDefinitionId())).map(SheetExportImportContextFieldDefinitionResponse::name).findFirst().orElse(value.fieldDefinitionId());
			result.put(name, value.value());
		}
		return result;
	}
	private SheetExportPayloadResponse buildCanonicalPayload(String name, String email, String phone, String status, String initialRiskLevel, Map<String, String> customFields) {
		Map<String, String> sorted = new LinkedHashMap<>();
		customFields.entrySet().stream().sorted(Map.Entry.comparingByKey()).forEach(entry -> sorted.put(entry.getKey().trim(), normalizeTextValue(entry.getValue())));
		return new SheetExportPayloadResponse(
			new SheetExportPayloadCoreResponse(name.trim(), normalizeLower(email), normalizeTextValue(phone), normalizeTextValue(status), normalizeTextValue(initialRiskLevel)),
			sorted
		);
	}
	private String normalizeLower(String value) { String n = normalizeTextValue(value); return n == null ? null : n.toLowerCase(); }
	private String hashPayload(SheetExportPayloadResponse payload) {
		try {
			String raw = objectMapper.writeValueAsString(payload);
			return java.util.HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(raw.getBytes(StandardCharsets.UTF_8)));
		} catch (Exception error) { throw new IllegalStateException("payload hash를 계산하지 못했습니다.", error); }
	}
	private List<String> diffPayloadFields(SheetExportPayloadResponse base, SheetExportPayloadResponse next) {
		List<String> changed = new ArrayList<>();
		if (!safeEquals(base.core().name(), next.core().name())) changed.add("이름");
		if (!safeEquals(base.core().email(), next.core().email())) changed.add("이메일");
		if (!safeEquals(base.core().phone(), next.core().phone())) changed.add("전화번호");
		if (!safeEquals(base.core().status(), next.core().status())) changed.add("수강 상태");
		if (!safeEquals(base.core().initialRiskLevel(), next.core().initialRiskLevel())) changed.add("위험도");
		Set<String> keys = new LinkedHashSet<>(); keys.addAll(base.customFields().keySet()); keys.addAll(next.customFields().keySet());
		for (String key : keys.stream().sorted().toList()) if (!safeEquals(base.customFields().get(key), next.customFields().get(key))) changed.add(key);
		return changed;
	}
	private boolean safeEquals(Object a, Object b) { return java.util.Objects.equals(a, b); }
	private static final class MutableSummary {
		int created; int updated; int unchanged; int skipped; int conflicts;
		MutableSummary withConflict() { this.conflicts = 1; return this; }
		SheetExportImportSummaryResponse toResponse() { return new SheetExportImportSummaryResponse(created, updated, unchanged, skipped, conflicts); }
	}
}
