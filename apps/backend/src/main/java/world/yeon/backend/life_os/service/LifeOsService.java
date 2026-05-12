package world.yeon.backend.life_os.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import world.yeon.backend.life_os.dto.*;
import world.yeon.backend.life_os.repository.LifeOsRepository;

@Service
public class LifeOsService {
	private static final String[] CATEGORIES = {"deep_work","learning","admin","meeting","rest","meal","movement","exercise","social","other"};
	private static final Set<String> ACTIVE_CATEGORIES = Set.of("deep_work","learning","admin","meeting","exercise");
	private static final Set<String> OVERPLANNED_OUTCOMES = Set.of("planned_no_action","rest_instead_of_plan","logistics_displacement","category_swap","spillover_candidate","unknown_mismatch");
	private static final Map<String, List<String>> CATEGORY_KEYWORDS = Map.of(
		"deep_work", List.of("코딩","개발","구현","리팩토링","설계","pr","버그","디버깅"),
		"learning", List.of("공부","학습","강의","시험","문제","sql","코테","독서"),
		"admin", List.of("정리","메일","서류","신청","예약","문서","회의준비"),
		"meeting", List.of("회의","미팅","통화","상담","인터뷰"),
		"rest", List.of("휴식","잠","수면","낮잠","쉬기","멍","유튜브"),
		"meal", List.of("밥","식사","점심","저녁","아침","카페"),
		"movement", List.of("이동","지하철","버스","운전","산책"),
		"exercise", List.of("운동","헬스","러닝","스트레칭"),
		"social", List.of("친구","가족","약속","커뮤니티"),
		"other", List.of()
	);

	private final LifeOsRepository repository;
	private final ObjectMapper objectMapper = new ObjectMapper();

	public LifeOsService(LifeOsRepository repository) {
		this.repository = repository;
	}

	public GetLifeOsDaysResponse listDays(UUID userId) {
		return new GetLifeOsDaysResponse(repository.listDays(userId).stream().map(this::toDto).toList());
	}

	public GetLifeOsDayResponse getDay(UUID userId, String localDate) {
		validateLocalDate(localDate, "날짜 형식이 올바르지 않습니다.");
		var row = repository.findDay(userId, localDate);
		return new GetLifeOsDayResponse(row == null ? buildEmptyDay(localDate) : toDto(row));
	}

	public GetLifeOsDayResponse upsertDay(UUID userId, UpsertLifeOsDayRequest request) {
		String localDate = request == null ? null : request.localDate();
		validateLocalDate(localDate, "Life OS 기록 형식이 올바르지 않습니다.");
		String timezone = normalizeRequired(request.timezone(), "Asia/Seoul");
		String mindset = normalizeNullable(request.mindset());
		String backlogText = normalizeNullable(request.backlogText());
		List<LifeOsHourEntryDto> entries = normalizeEntries(request.entries());
		try {
			var row = repository.upsertDay(userId, generatePublicId("lod"), localDate, timezone, mindset, backlogText, objectMapper.writeValueAsString(entries), OffsetDateTime.now(ZoneOffset.UTC));
			if (row == null) {
				throw new LifeOsServiceException(500, "LIFE_OS_UPSERT_FAILED", "Life OS 기록을 저장하지 못했습니다.");
			}
			return new GetLifeOsDayResponse(toDto(row));
		} catch (JsonProcessingException error) {
			throw new IllegalStateException("Life OS entries를 직렬화하지 못했습니다.", error);
		}
	}

	public LifeOsReportResponse buildDailyReport(UUID userId, String localDate) {
		validateLocalDate(localDate, "리포트 날짜 형식이 올바르지 않습니다.");
		LifeOsDayDto day = getDay(userId, localDate).day();
		Map<String, Object> metrics = computeDailyMetrics(day.localDate(), day.entries());
		return new LifeOsReportResponse(buildReport("daily", localDate, localDate, metrics));
	}

	public LifeOsReportResponse buildWeeklyReport(UUID userId, String periodStart, String periodEnd) {
		validateLocalDate(periodStart, "주간 리포트 기간 형식이 올바르지 않습니다.");
		validateLocalDate(periodEnd, "주간 리포트 기간 형식이 올바르지 않습니다.");
		if (periodStart.compareTo(periodEnd) > 0) {
			throw new IllegalArgumentException("주간 리포트 기간 형식이 올바르지 않습니다.");
		}
		List<Map<String, Object>> dailyMetrics = repository.findDaysBetween(userId, periodStart, periodEnd).stream()
			.map(this::toDto)
			.map(day -> computeDailyMetrics(day.localDate(), day.entries()))
			.toList();
		Map<String, Object> metrics = computeWeeklyMetrics(periodStart, periodEnd, dailyMetrics);
		return new LifeOsReportResponse(buildReport("weekly", periodStart, periodEnd, metrics));
	}

	private LifeOsDayDto toDto(LifeOsRepository.LifeOsDayRow row) {
		return new LifeOsDayDto(
			row.publicId(),
			row.localDate(),
			normalizeRequired(row.timezone(), "Asia/Seoul"),
			normalizeNullable(row.mindset()),
			normalizeNullable(row.backlogText()),
			normalizeEntries(row.entries()),
			row.createdAt() == null ? null : row.createdAt().toInstant().toString(),
			row.updatedAt() == null ? null : row.updatedAt().toInstant().toString()
		);
	}

	private LifeOsDayDto buildEmptyDay(String localDate) {
		return new LifeOsDayDto(null, localDate, "Asia/Seoul", "", "", createEmptyEntries(), null, null);
	}

	private List<LifeOsHourEntryDto> normalizeEntries(List<LifeOsHourEntryDto> entries) {
		Map<Integer, LifeOsHourEntryDto> byHour = new HashMap<>();
		if (entries != null) {
			for (LifeOsHourEntryDto entry : entries) {
				if (entry == null) continue;
				if (entry.hour() < 0 || entry.hour() > 23) continue;
				byHour.put(entry.hour(), new LifeOsHourEntryDto(
					entry.hour(),
					normalizeNullable(entry.goalText()),
					normalizeNullable(entry.actionText()),
					normalizeOptional(entry.goalCategory()),
					normalizeOptional(entry.actionCategory()),
					normalizeNullable(entry.note())
				));
			}
		}
		List<LifeOsHourEntryDto> result = new ArrayList<>();
		for (int hour = 0; hour < 24; hour += 1) {
			LifeOsHourEntryDto existing = byHour.get(hour);
			result.add(existing != null ? existing : new LifeOsHourEntryDto(hour, "", "", null, null, ""));
		}
		return result;
	}

	private List<LifeOsHourEntryDto> createEmptyEntries() {
		return normalizeEntries(List.of());
	}

	private Map<String, Object> computeDailyMetrics(String localDate, List<LifeOsHourEntryDto> entries) {
		List<Map<String, Object>> classifications = new ArrayList<>();
		Map<String, Integer> mismatchByBlock = new LinkedHashMap<>();
		mismatchByBlock.put("0-7", 0); mismatchByBlock.put("8-15", 0); mismatchByBlock.put("16-23", 0);
		int plannedHours = 0;
		int actionHours = 0;
		int matchedHours = 0;
		int overplannedHours = 0;
		int restInsteadOfPlanHours = 0;
		int unrelatedActionHours = 0;
		int spilloverHours = 0;
		for (int index = 0; index < entries.size(); index += 1) {
			LifeOsHourEntryDto entry = entries.get(index);
			Map<String, Object> classification = classifyHour(entry, index > 0 ? entries.get(index - 1) : null);
			classifications.add(classification);
			boolean hasGoal = !normalizeText(entry.goalText()).isBlank();
			boolean hasAction = !normalizeText(entry.actionText()).isBlank();
			if (hasGoal) plannedHours += 1;
			if (hasAction) actionHours += 1;
			String outcome = (String) classification.get("outcome");
			if ("matched".equals(outcome)) matchedHours += 1;
			if ((Boolean) classification.get("overplanned")) {
				overplannedHours += 1;
				String block = blockKey(entry.hour());
				mismatchByBlock.put(block, mismatchByBlock.get(block) + 1);
			}
			if ("rest_instead_of_plan".equals(outcome)) restInsteadOfPlanHours += 1;
			if (Set.of("category_swap", "unknown_mismatch", "logistics_displacement").contains(outcome)) unrelatedActionHours += 1;
			if ("spillover_candidate".equals(outcome)) spilloverHours += 1;
		}
		Map<String, Object> metrics = new LinkedHashMap<>();
		metrics.put("localDate", localDate);
		metrics.put("plannedHours", plannedHours);
		metrics.put("actionHours", actionHours);
		metrics.put("matchedHours", matchedHours);
		metrics.put("overplannedHours", overplannedHours);
		metrics.put("restInsteadOfPlanHours", restInsteadOfPlanHours);
		metrics.put("unrelatedActionHours", unrelatedActionHours);
		metrics.put("spilloverHours", spilloverHours);
		metrics.put("overplanningScore", Math.round((overplannedHours / (double) Math.max(plannedHours, 1)) * 100));
		metrics.put("mismatchByBlock", mismatchByBlock);
		metrics.put("classifications", classifications);
		if (plannedHours + actionHours < 4) {
			metrics.put("caveat", "기록이 적어 확신도 낮음: 하루 4칸 미만 기록입니다.");
		}
		return metrics;
	}

	private Map<String, Object> computeWeeklyMetrics(String periodStart, String periodEnd, List<Map<String, Object>> days) {
		int plannedHours = sumMetric(days, "plannedHours");
		int actionHours = sumMetric(days, "actionHours");
		int matchedHours = sumMetric(days, "matchedHours");
		int overplannedHours = sumMetric(days, "overplannedHours");
		Map<String, Object> metrics = new LinkedHashMap<>();
		metrics.put("periodStart", periodStart);
		metrics.put("periodEnd", periodEnd);
		metrics.put("days", days);
		metrics.put("plannedHours", plannedHours);
		metrics.put("actionHours", actionHours);
		metrics.put("matchedHours", matchedHours);
		metrics.put("overplannedHours", overplannedHours);
		metrics.put("overplanningScore", Math.round((overplannedHours / (double) Math.max(plannedHours, 1)) * 100));
		if (plannedHours + actionHours < 12) {
			metrics.put("caveat", "주간 기록이 적어 반복 패턴은 참고용입니다.");
		}
		return metrics;
	}

	private int sumMetric(List<Map<String, Object>> days, String key) {
		return days.stream().mapToInt(day -> ((Number) day.getOrDefault(key, 0)).intValue()).sum();
	}

	private Map<String, Object> buildReport(String periodType, String periodStart, String periodEnd, Map<String, Object> metrics) {
		List<Map<String, Object>> patterns = detectPatterns(metrics);
		Map<String, Object> report = new LinkedHashMap<>();
		report.put("periodType", periodType);
		report.put("periodStart", periodStart);
		report.put("periodEnd", periodEnd);
		report.put("metrics", metrics);
		report.put("patterns", patterns);
		report.put("recommendations", patterns.stream().map(this::recommendationForPattern).toList());
		report.put("generatedAt", OffsetDateTime.now(ZoneOffset.UTC).toInstant().toString());
		report.put("aiSummary", null);
		return report;
	}

	@SuppressWarnings("unchecked")
	private List<Map<String, Object>> detectPatterns(Map<String, Object> metrics) {
		List<Map<String, Object>> days = metrics.containsKey("days") ? (List<Map<String, Object>>) metrics.get("days") : List.of(metrics);
		List<Map<String, Object>> patterns = new ArrayList<>();
		Map<String, Integer> blockDayCounts = new LinkedHashMap<>();
		Map<String, CategoryCounter> categoryCounts = new LinkedHashMap<>();
		for (Map<String, Object> day : days) {
			Map<String, Integer> mismatchByBlock = (Map<String, Integer>) day.get("mismatchByBlock");
			for (String block : List.of("0-7", "8-15", "16-23")) {
				if (((Number) mismatchByBlock.getOrDefault(block, 0)).intValue() > 0) {
					blockDayCounts.put(block, blockDayCounts.getOrDefault(block, 0) + 1);
				}
			}
			List<Map<String, Object>> classifications = (List<Map<String, Object>>) day.get("classifications");
			for (Map<String, Object> item : classifications) {
				String goalCategory = (String) item.get("goalCategory");
				if ("other".equals(goalCategory)) continue;
				CategoryCounter counter = categoryCounts.computeIfAbsent(goalCategory, ignored -> new CategoryCounter());
				counter.planned += 1;
				if ((Boolean) item.get("overplanned")) {
					counter.mismatch += 1;
					counter.hours.add(((Number) item.get("hour")).intValue());
				}
			}
			List<Integer> denseMismatchHours = findDenseMismatchHours(classifications);
			if (denseMismatchHours.size() >= 2) {
				patterns.add(pattern(
					"dense_planning_then_mismatch",
					"연속 계획 뒤 mismatch가 이어졌습니다.",
					day.get("localDate") + "에 " + joinHours(denseMismatchHours) + "시에 과계획 신호가 이어졌습니다.",
					denseMismatchHours,
					uniqueCategories(classifications, denseMismatchHours),
					"medium"
				));
			}
		}
		for (Map.Entry<String, Integer> entry : blockDayCounts.entrySet()) {
			if (entry.getValue() >= 2) {
				patterns.add(pattern(
					"repeated_overplanned_block",
					entry.getKey() + " 블록에서 반복 과계획이 보입니다.",
					entry.getValue() + "일 이상 같은 시간대에 계획 대비 실행 mismatch가 있었습니다.",
					hoursForBlock(entry.getKey()),
					List.of(),
					entry.getValue() >= 3 ? "high" : "medium"
				));
			}
		}
		for (Map.Entry<String, CategoryCounter> entry : categoryCounts.entrySet()) {
			double mismatchRate = entry.getValue().planned == 0 ? 0 : (double) entry.getValue().mismatch / entry.getValue().planned;
			if (entry.getValue().planned >= 3 && mismatchRate >= 0.5) {
				patterns.add(pattern(
					"repeated_overplanned_category",
					entry.getKey() + " 계획의 실행 전환율이 낮습니다.",
					entry.getKey() + " 계획 " + entry.getValue().planned + "칸 중 " + entry.getValue().mismatch + "칸이 과계획으로 분류됐습니다.",
					entry.getValue().hours.stream().sorted().toList(),
					List.of(entry.getKey()),
					mismatchRate >= 0.75 ? "high" : "medium"
				));
			}
		}
		int totalPlanned = days.stream().mapToInt(day -> ((Number) day.getOrDefault("plannedHours", 0)).intValue()).sum();
		int totalAction = days.stream().mapToInt(day -> ((Number) day.getOrDefault("actionHours", 0)).intValue()).sum();
		if (totalPlanned >= 4 && totalPlanned > totalAction) {
			patterns.add(pattern(
				"planned_capacity_exceeds_actual",
				"계획 시간이 실제 실행 시간보다 큽니다.",
				"계획 " + totalPlanned + "시간, 실행 " + totalAction + "시간으로 " + (totalPlanned - totalAction) + "시간 차이가 있습니다.",
				List.of(),
				List.of(),
				totalPlanned - totalAction >= 4 ? "high" : "medium"
			));
		}
		return patterns;
	}

	private Map<String, Object> recommendationForPattern(Map<String, Object> pattern) {
		String type = (String) pattern.get("type");
		Map<String, Object> result = new LinkedHashMap<>();
		result.put("title", switch (type) {
			case "repeated_overplanned_block" -> "반복 mismatch 시간대의 계획량을 줄이세요.";
			case "repeated_overplanned_category" -> "반복 mismatch 카테고리를 더 작은 단위로 계획하세요.";
			case "dense_planning_then_mismatch" -> "연속 계획 사이에 완충 시간을 넣으세요.";
			default -> "다음 계획의 총량을 실제 실행량에 맞추세요.";
		});
		result.put("evidence", pattern.get("evidence"));
		result.put("suggestedAdjustment", switch (type) {
			case "repeated_overplanned_block" -> "해당 블록에는 핵심 목표 1개만 두고 나머지는 backlog/memo로 내려놓습니다.";
			case "repeated_overplanned_category" -> "같은 카테고리 계획을 30~60분 단위로 쪼개고, 시작 조건을 한 줄로 적습니다.";
			case "dense_planning_then_mismatch" -> "3시간 이상 연속 계획을 피하고 중간에 회복/정리 블록을 예약합니다.";
			default -> "최근 실제 실행 시간의 80%만 다음 계획에 배치하고 남은 시간은 비워둡니다.";
		});
		result.put("confidence", pattern.get("confidence"));
		result.put("affectedHours", pattern.get("affectedHours"));
		result.put("affectedCategories", pattern.get("affectedCategories"));
		return result;
	}

	private Map<String, Object> pattern(String type, String title, String evidence, List<Integer> affectedHours, List<String> affectedCategories, String confidence) {
		Map<String, Object> pattern = new LinkedHashMap<>();
		pattern.put("type", type);
		pattern.put("title", title);
		pattern.put("evidence", evidence);
		pattern.put("affectedHours", affectedHours);
		pattern.put("affectedCategories", affectedCategories);
		pattern.put("confidence", confidence);
		return pattern;
	}

	private List<Integer> findDenseMismatchHours(List<Map<String, Object>> classifications) {
		LinkedHashSet<Integer> result = new LinkedHashSet<>();
		for (int index = 0; index < classifications.size() - 2; index += 1) {
			List<Map<String, Object>> window = classifications.subList(index, index + 3);
			int plannedCount = (int) window.stream().filter(item -> !"other".equals(item.get("goalCategory"))).count();
			List<Integer> mismatchHours = window.stream().filter(item -> (Boolean) item.get("overplanned")).map(item -> ((Number) item.get("hour")).intValue()).toList();
			if (plannedCount == 3 && mismatchHours.size() >= 2) {
				result.addAll(mismatchHours);
			}
		}
		return new ArrayList<>(result);
	}

	private List<String> uniqueCategories(List<Map<String, Object>> classifications, List<Integer> hours) {
		LinkedHashSet<String> categories = new LinkedHashSet<>();
		for (Map<String, Object> item : classifications) {
			int hour = ((Number) item.get("hour")).intValue();
			String category = (String) item.get("goalCategory");
			if (hours.contains(hour) && category != null && !"other".equals(category)) {
				categories.add(category);
			}
		}
		return new ArrayList<>(categories);
	}

	private Map<String, Object> classifyHour(LifeOsHourEntryDto entry, LifeOsHourEntryDto previousEntry) {
		String goalText = normalizeText(entry.goalText());
		String actionText = normalizeText(entry.actionText());
		boolean hasGoal = !goalText.isBlank();
		boolean hasAction = !actionText.isBlank();
		if (!hasGoal && !hasAction) {
			return classification(entry.hour(), "empty", "other", "other", false, "high", "목표와 실행이 모두 비어 있습니다.");
		}
		String goalCategory = inferCategory(entry.goalText(), entry.goalCategory());
		String actionCategory = inferCategory(entry.actionText(), entry.actionCategory());
		if (!hasGoal && hasAction) {
			String outcome = ("rest".equals(actionCategory) || "meal".equals(actionCategory)) ? "unplanned_rest" : "unplanned_productive";
			return classification(entry.hour(), outcome, goalCategory, actionCategory, false, "other".equals(actionCategory) ? "low" : "medium", "unplanned_rest".equals(outcome) ? "계획 없이 휴식/식사가 기록됐습니다." : "계획 없이 생산 활동이 기록됐습니다.");
		}
		if (hasGoal && !hasAction) {
			return classification(entry.hour(), "planned_no_action", goalCategory, actionCategory, true, "high", "계획은 있지만 실행 기록이 없습니다.");
		}
		String previousActionCategory = previousEntry == null ? "other" : inferCategory(previousEntry.actionText(), previousEntry.actionCategory());
		if (!"other".equals(previousActionCategory) && !"other".equals(actionCategory) && actionCategory.equals(previousActionCategory) && !"other".equals(goalCategory) && !goalCategory.equals(actionCategory) && hasGoal) {
			return classification(entry.hour(), "spillover_candidate", goalCategory, actionCategory, true, "medium", "이전 시간의 실행 분류가 다른 목표 시간으로 이어졌습니다.");
		}
		KnownOutcome known = classifyKnown(goalText, actionText, goalCategory, actionCategory);
		return classification(entry.hour(), known.outcome, goalCategory, actionCategory, isOverplanned(known.outcome, hasGoal), known.confidence, known.reason);
	}

	private KnownOutcome classifyKnown(String goalText, String actionText, String goalCategory, String actionCategory) {
		if (!"other".equals(goalCategory) && goalCategory.equals(actionCategory)) {
			return new KnownOutcome("matched", "high", "목표와 실행 분류가 일치합니다.");
		}
		if ("other".equals(goalCategory) && "other".equals(actionCategory)) {
			if (goalText.equals(actionText)) {
				return new KnownOutcome("matched", "medium", "분류는 불명확하지만 텍스트가 같습니다.");
			}
			return new KnownOutcome("unknown_mismatch", "low", "목표와 실행 모두 분류가 불명확하고 텍스트가 다릅니다.");
		}
		if (ACTIVE_CATEGORIES.contains(goalCategory) && ("rest".equals(actionCategory) || "meal".equals(actionCategory))) {
			return new KnownOutcome("rest_instead_of_plan", "high", "활동 계획이 휴식/식사로 대체됐습니다.");
		}
		if (ACTIVE_CATEGORIES.contains(goalCategory) && "movement".equals(actionCategory)) {
			return new KnownOutcome("logistics_displacement", "high", "활동 계획이 이동/물류 시간으로 밀렸습니다.");
		}
		if (!"other".equals(goalCategory) && !"other".equals(actionCategory)) {
			return new KnownOutcome("category_swap", "high", "목표와 실행의 분류가 다릅니다.");
		}
		return new KnownOutcome("unknown_mismatch", "low", "일부 분류가 불명확하지만 목표와 실행이 다릅니다.");
	}

	private Map<String, Object> classification(int hour, String outcome, String goalCategory, String actionCategory, boolean overplanned, String confidence, String reason) {
		Map<String, Object> result = new LinkedHashMap<>();
		result.put("hour", hour);
		result.put("outcome", outcome);
		result.put("goalCategory", goalCategory);
		result.put("actionCategory", actionCategory);
		result.put("overplanned", overplanned);
		result.put("confidence", confidence);
		result.put("reason", reason);
		return result;
	}

	private String inferCategory(String text, String explicitCategory) {
		String normalizedExplicit = normalizeOptional(explicitCategory);
		if (normalizedExplicit != null && !"other".equals(normalizedExplicit)) return normalizedExplicit;
		String normalized = normalizeText(text);
		if (normalized.isBlank()) return "other";
		for (Map.Entry<String, List<String>> entry : CATEGORY_KEYWORDS.entrySet()) {
			if ("other".equals(entry.getKey())) continue;
			for (String keyword : entry.getValue()) {
				if (normalized.contains(keyword.toLowerCase(Locale.ROOT))) return entry.getKey();
			}
		}
		return "other";
	}

	private boolean isOverplanned(String outcome, boolean hasGoal) {
		if ("unknown_mismatch".equals(outcome)) return hasGoal;
		return OVERPLANNED_OUTCOMES.contains(outcome);
	}

	private String blockKey(int hour) {
		if (hour >= 16) return "16-23";
		if (hour >= 8) return "8-15";
		return "0-7";
	}

	private List<Integer> hoursForBlock(String block) {
		if ("16-23".equals(block)) return range(16, 23);
		if ("8-15".equals(block)) return range(8, 15);
		return range(0, 7);
	}

	private List<Integer> range(int start, int end) {
		List<Integer> result = new ArrayList<>();
		for (int value = start; value <= end; value += 1) result.add(value);
		return result;
	}

	private String joinHours(List<Integer> hours) {
		return hours.stream().map(String::valueOf).reduce((a, b) -> a + ", " + b).orElse("");
	}

	private void validateLocalDate(String value, String message) {
		if (value == null || !value.matches("^\\d{4}-\\d{2}-\\d{2}$")) {
			throw new IllegalArgumentException(message);
		}
	}

	private String normalizeRequired(String value, String fallback) {
		String normalized = normalizeNullable(value);
		return normalized.isBlank() ? fallback : normalized;
	}

	private String normalizeNullable(String value) {
		return value == null ? "" : value;
	}

	private String normalizeOptional(String value) {
		if (value == null) return null;
		String trimmed = value.trim();
		return trimmed.isBlank() ? null : trimmed;
	}

	private String normalizeText(String value) {
		return (value == null ? "" : value).trim().replaceAll("\\s+", " ").toLowerCase(Locale.ROOT);
	}

	private String generatePublicId(String prefix) {
		return prefix + "_" + UUID.randomUUID().toString().replace("-", "").substring(0, 24);
	}

	private static final class KnownOutcome {
		private final String outcome;
		private final String confidence;
		private final String reason;
		private KnownOutcome(String outcome, String confidence, String reason) { this.outcome = outcome; this.confidence = confidence; this.reason = reason; }
	}

	private static final class CategoryCounter {
		private int planned = 0;
		private int mismatch = 0;
		private final Set<Integer> hours = new LinkedHashSet<>();
	}
}
