package world.yeon.backend.import_commit.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import world.yeon.backend.import_commit.dto.*;
import world.yeon.backend.import_commit.repository.ImportCommitRepository;

@Service
@Profile("jdbc")
public class ImportCommitService {
	private static final List<Object[]> DEFAULT_SYSTEM_TABS = List.of(
		new Object[]{"overview", "개요", 0},
		new Object[]{"student_board", "출석·과제", 1},
		new Object[]{"counseling", "상담기록", 2},
		new Object[]{"memos", "메모", 3},
		new Object[]{"report", "리포트", 4}
	);
	private static final Set<String> VALID_FIELD_TYPES = Set.of("text","long_text","url","email","phone","date","number","checkbox","select","multi_select");
	private static final Map<String, List<String>> CATEGORY_HINTS = Map.of(
		"email", List.of("이메일","e-mail","email"),
		"phone", List.of("연락처","전화","휴대폰","핸드폰","phone","mobile","tel"),
		"url", List.of("url","링크","github","git","포트폴리오","portfolio","behance","notion","blog","website","site","homepage"),
		"date", List.of("생년월일","날짜","date","시작일","종료일")
	);
	private final ImportCommitRepository repository;
	private final ObjectMapper objectMapper = new ObjectMapper();

	public ImportCommitService(ImportCommitRepository repository) { this.repository = repository; }

	@Transactional
	public ImportCommitResponse commitImport(UUID userId, ImportCommitRequest request) {
		if (request == null || request.preview() == null || request.preview().cohorts() == null || request.preview().cohorts().isEmpty()) {
			throw new IllegalArgumentException("요청 데이터가 올바르지 않습니다.");
		}
		if (request.draftId() != null && !request.draftId().isBlank()) {
			if (repository.findOwnedDraft(userId, request.draftId()) == null) {
				throw new ImportCommitServiceException(404, "DRAFT_NOT_FOUND", "복구할 가져오기 초안을 찾지 못했습니다.");
			}
			repository.markDraftImporting(userId, request.draftId());
		}
		int spacesCreated = 0;
		int membersCreated = 0;
		List<String> spaceIds = new ArrayList<>();
		for (ImportCohortRequest cohort : request.preview().cohorts()) {
			String spaceName = normalizeSpaceName(cohort.name());
			String startDate = normalizeDate(cohort.startDate());
			String endDate = normalizeDate(cohort.endDate());
			String periodError = validatePeriod(startDate, endDate);
			if (periodError != null) {
				throw new ImportCommitServiceException(400, "INVALID_PERIOD", '"' + spaceName + '"' + " 진행기간이 올바르지 않습니다. " + periodError);
			}
			List<ImportStudentRequest> students = cohort.students() == null ? List.of() : cohort.students();
			for (ImportStudentRequest student : students) {
				if (student == null || normalizeName(student.name(), 100).isBlank()) {
					throw new ImportCommitServiceException(400, "INVALID_MEMBER_NAME", "수강생 이름은 필수입니다.");
				}
			}
			OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
			var createdSpace = repository.insertSpace(generatePublicId("spc"), spaceName, startDate, endDate, userId, now);
			spaceIds.add(createdSpace.publicId());
			List<Object[]> tabs = new ArrayList<>();
			for (Object[] tab : DEFAULT_SYSTEM_TABS) tabs.add(new Object[]{generatePublicId("mtb"), tab[0], tab[1], tab[2]});
			var insertedTabs = repository.insertDefaultTabs(createdSpace.id(), userId, now, tabs);
			Long overviewTabId = insertedTabs.stream().filter(tab -> "overview".equals(tab.systemKey())).map(ImportCommitRepository.InsertedTabRow::id).findFirst().orElse(null);
			if (overviewTabId == null) throw new ImportCommitServiceException(500, "OVERVIEW_TAB_MISSING", "가져오기용 개요 탭을 준비하지 못했습니다.");
			List<Object[]> customFieldSpecs = collectCustomFieldSpecs(students);
			Map<String, ImportCommitRepository.InsertedFieldRow> fieldMap = new LinkedHashMap<>();
			if (!customFieldSpecs.isEmpty()) {
				List<Object[]> insertFields = new ArrayList<>();
				for (int i = 0; i < customFieldSpecs.size(); i++) {
					Object[] spec = customFieldSpecs.get(i);
					insertFields.add(new Object[]{generatePublicId("mfd"), spec[0], spec[1], i});
				}
				for (var field : repository.insertCustomFields(createdSpace.id(), overviewTabId, userId, now, insertFields)) fieldMap.put(field.name(), field);
			}
			for (ImportStudentRequest student : students) {
				var insertedMember = repository.insertMember(createdSpace.id(), generatePublicId("mem"), normalizeName(student.name(), 100), trimToNull(student.email(), 255), trimToNull(student.phone(), 20), defaultStatus(student.status()), now);
				Map<String, String> customFields = student.customFields() == null ? Map.of() : student.customFields();
				for (Map.Entry<String, String> entry : customFields.entrySet()) {
					String fieldName = trimToNull(entry.getKey(), 80);
					String value = trimToNull(entry.getValue(), 5000);
					if (fieldName == null || value == null) continue;
					var field = fieldMap.get(fieldName);
					if (field == null) continue;
					ValueColumns columns = buildValueColumns(field.fieldType(), value);
					repository.insertFieldValue(insertedMember.id(), field.id(), generatePublicId("mfv"), columns.valueText, columns.valueNumber, columns.valueBoolean, columns.valueJson, now);
				}
			}
			spacesCreated += 1;
			membersCreated += students.size();
		}
		ImportCommitResponse response = new ImportCommitResponse(new ImportCreatedCountsResponse(spacesCreated, membersCreated), spaceIds);
		if (request.draftId() != null && !request.draftId().isBlank()) {
			try {
				repository.markDraftImported(userId, request.draftId(), objectMapper.writeValueAsString(Map.of("spaces", spacesCreated, "members", membersCreated, "spaceIds", spaceIds)));
			} catch (JsonProcessingException error) {
				throw new IllegalStateException("import result 직렬화에 실패했습니다.", error);
			}
		}
		return response;
	}

	private List<Object[]> collectCustomFieldSpecs(List<ImportStudentRequest> students) {
		Map<String, List<String>> samples = new LinkedHashMap<>();
		for (ImportStudentRequest student : students) {
			Map<String, String> customFields = student.customFields() == null ? Map.of() : student.customFields();
			for (Map.Entry<String, String> entry : customFields.entrySet()) {
				String name = trimToNull(entry.getKey(), 80);
				String value = trimToNull(entry.getValue(), 5000);
				if (name == null) continue;
				samples.computeIfAbsent(name, ignored -> new ArrayList<>());
				if (value != null) samples.get(name).add(value);
			}
		}
		List<Object[]> specs = new ArrayList<>();
		for (Map.Entry<String, List<String>> entry : samples.entrySet()) {
			if (entry.getValue().isEmpty()) continue;
			specs.add(new Object[]{entry.getKey(), inferCustomFieldType(entry.getKey(), entry.getValue())});
		}
		return specs;
	}

	private String inferCustomFieldType(String name, List<String> values) {
		String lowered = name.toLowerCase(Locale.ROOT);
		String compact = name.replaceAll("\\s+", "");
		if (compact.matches("^(긴급|비상)연락처(관계)?$")) return "text";
		if (name.contains("관계") || lowered.contains("relation")) return "text";
		if (matchesHint("email", name, lowered) || values.stream().anyMatch(this::looksLikeEmail)) return "email";
		if (matchesHint("phone", name, lowered) || values.stream().anyMatch(this::looksLikePhone)) return "phone";
		if (matchesHint("url", name, lowered) || values.stream().anyMatch(this::looksLikeUrl)) return "url";
		if (matchesHint("date", name, lowered) || values.stream().anyMatch(this::looksLikeDate)) return "date";
		if (values.stream().anyMatch(value -> value.length() > 100 || value.contains("\n"))) return "long_text";
		return "text";
	}

	private boolean matchesHint(String key, String name, String lowered) { return CATEGORY_HINTS.getOrDefault(key, List.of()).stream().anyMatch(h -> name.contains(h) || lowered.contains(h)); }
	private boolean looksLikeEmail(String value) { return value.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"); }
	private boolean looksLikePhone(String value) { int digits = value.replaceAll("\\D", "").length(); return digits >= 9 && digits <= 12; }
	private boolean looksLikeUrl(String value) { String lower = value.toLowerCase(Locale.ROOT); return lower.startsWith("http://") || lower.startsWith("https://") || lower.startsWith("www."); }
	private boolean looksLikeDate(String value) { return value.matches("^\\d{4}[-/.]\\d{1,2}[-/.]\\d{1,2}$"); }

	private String normalizeSpaceName(String value) {
		String name = normalizeName(value, 100);
		if (name.isBlank()) throw new ImportCommitServiceException(400, "INVALID_SPACE_NAME", "스페이스 이름은 필수입니다.");
		return name;
	}
	private String normalizeName(String value, int max) { return value == null ? "" : value.trim().substring(0, Math.min(value.trim().length(), max)); }
	private String trimToNull(String value, int max) { if (value == null) return null; String t = value.trim(); return t.isBlank() ? null : t.substring(0, Math.min(t.length(), max)); }
	private String defaultStatus(String value) { String t = trimToNull(value, 20); return t == null ? "active" : t; }
	private String normalizeDate(String value) { String t = trimToNull(value, 10); return t == null ? null : t; }
	private String validatePeriod(String startDate, String endDate) {
		if ((startDate == null) != (endDate == null)) return "진행기간을 입력하려면 시작일과 종료일을 모두 선택해 주세요.";
		if (startDate == null) return null;
		if (!startDate.matches("^\\d{4}-\\d{2}-\\d{2}$") || !endDate.matches("^\\d{4}-\\d{2}-\\d{2}$")) return "진행기간 날짜 형식이 올바르지 않습니다.";
		if (endDate.compareTo(startDate) < 0) return "종료일은 시작일보다 빠를 수 없습니다.";
		return null;
	}
	private String generatePublicId(String prefix) { return prefix + "_" + UUID.randomUUID().toString().replace("-", "").substring(0, 24); }

	private ValueColumns buildValueColumns(String fieldType, String value) {
		if (!VALID_FIELD_TYPES.contains(fieldType)) fieldType = "text";
		return switch (fieldType) {
			case "text", "long_text", "url", "email", "phone", "date" -> new ValueColumns(value.substring(0, Math.min(value.length(), 5000)), null, null, null);
			case "number" -> {
				double number = Double.parseDouble(value);
				yield new ValueColumns(null, String.valueOf(number), null, null);
			}
			case "checkbox" -> new ValueColumns(null, null, Boolean.parseBoolean(value), null);
			case "select", "multi_select" -> new ValueColumns(null, null, null, jsonArray(value));
			default -> new ValueColumns(value, null, null, null);
		};
	}
	private String jsonArray(String value) { try { return objectMapper.writeValueAsString(List.of(value)); } catch (JsonProcessingException e) { throw new IllegalStateException(e); } }
	private record ValueColumns(String valueText, String valueNumber, Boolean valueBoolean, String valueJson) {}
}
