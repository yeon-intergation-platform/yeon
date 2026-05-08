package world.yeon.backend.member_risk_profiles.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import world.yeon.backend.member_risk_profiles.dto.MemberRiskProfileRequestItem;
import world.yeon.backend.member_risk_profiles.dto.MemberRiskProfileResponseItem;
import world.yeon.backend.member_risk_profiles.dto.MemberRiskProfilesRequest;
import world.yeon.backend.member_risk_profiles.dto.MemberRiskProfilesResponse;
import world.yeon.backend.member_risk_profiles.repository.MemberRiskProfileRepository;

@Service
@Profile("jdbc")
public class MemberRiskProfileService {
	private static final Pattern[] HIGH_RISK_PATTERNS = new Pattern[]{
		Pattern.compile("중도[\\s-]*포기"), Pattern.compile("이탈"), Pattern.compile("그만두"), Pattern.compile("번아웃"),
		Pattern.compile("무기력"), Pattern.compile("심한\\s*불안"), Pattern.compile("결석"), Pattern.compile("장기\\s*지연"),
		Pattern.compile("완전히\\s*놓치"), Pattern.compile("자신감\\s*저하")
	};
	private static final Pattern[] MEDIUM_RISK_PATTERNS = new Pattern[]{
		Pattern.compile("과제\\s*지연"), Pattern.compile("집중"), Pattern.compile("걱정"), Pattern.compile("부담"),
		Pattern.compile("질문\\s*없"), Pattern.compile("리듬"), Pattern.compile("루틴"), Pattern.compile("흔들리"),
		Pattern.compile("지각"), Pattern.compile("참여\\s*저하")
	};
	private static final Map<String, Integer> RISK_LEVEL_SCORE = Map.of("low", 1, "medium", 2, "high", 3);

	private final MemberRiskProfileRepository repository;
	private final ObjectMapper objectMapper = new ObjectMapper();

	public MemberRiskProfileService(MemberRiskProfileRepository repository) {
		this.repository = repository;
	}

	public MemberRiskProfilesResponse getProfiles(UUID userId, MemberRiskProfilesRequest request) {
		List<MemberRiskProfileRequestItem> members = request == null || request.members() == null ? List.of() : request.members();
		List<String> memberIds = members.stream().map(MemberRiskProfileRequestItem::id).filter(id -> id != null && !id.isBlank()).toList();
		Map<String, List<MemberRiskProfileRepository.MemberRiskRecordRow>> recordsByMemberId = new HashMap<>();
		for (var record : repository.findRiskRecordsByMemberIds(userId, memberIds)) {
			recordsByMemberId.computeIfAbsent(record.memberId(), ignored -> new ArrayList<>()).add(record);
		}
		return new MemberRiskProfilesResponse(
			members.stream().map(member -> buildProfile(member, recordsByMemberId.getOrDefault(member.id(), List.of()))).toList()
		);
	}

	private MemberRiskProfileResponseItem buildProfile(
		MemberRiskProfileRequestItem member,
		List<MemberRiskProfileRepository.MemberRiskRecordRow> records
	) {
		List<MemberRiskProfileRepository.MemberRiskRecordRow> realRecords = records.stream()
			.filter(record -> !isDemoPlaceholderRecord(record))
			.sorted(Comparator.comparing(MemberRiskProfileRepository.MemberRiskRecordRow::createdAt).reversed())
			.toList();
		RepresentativeRisk representativeRisk = pickRepresentativeRisk(realRecords);

		return new MemberRiskProfileResponseItem(
			member.id(),
			representativeRisk == null ? null : representativeRisk.level(),
			representativeRisk == null ? null : representativeRisk.basis(),
			representativeRisk == null ? List.of() : representativeRisk.signals(),
			representativeRisk != null ? "counseling_ai" : (member.initialRiskLevel() != null ? "manual" : null),
			realRecords.size(),
			realRecords.isEmpty() ? null : realRecords.getFirst().createdAt().toInstant().toString()
		);
	}

	private boolean isDemoPlaceholderRecord(MemberRiskProfileRepository.MemberRiskRecordRow record) {
		return "demo_placeholder".equals(record.recordSource()) || (record.audioStoragePath() != null && record.audioStoragePath().contains("demo-placeholder"));
	}

	private RepresentativeRisk pickRepresentativeRisk(List<MemberRiskProfileRepository.MemberRiskRecordRow> records) {
		List<RepresentativeRisk> analyzed = records.stream()
			.map(this::deriveRiskFromRecord)
			.filter(item -> item != null)
			.sorted(Comparator.comparing(RepresentativeRisk::createdAt).reversed())
			.limit(3)
			.toList();
		if (analyzed.isEmpty()) {
			return null;
		}
		return analyzed.stream()
			.sorted((left, right) -> {
				int scoreGap = RISK_LEVEL_SCORE.getOrDefault(right.level(), 0) - RISK_LEVEL_SCORE.getOrDefault(left.level(), 0);
				if (scoreGap != 0) return scoreGap;
				return right.createdAt().compareTo(left.createdAt());
			})
			.findFirst()
			.orElse(null);
	}

	private RepresentativeRisk deriveRiskFromRecord(MemberRiskProfileRepository.MemberRiskRecordRow record) {
		if (record.analysisResult() == null) {
			return null;
		}
		JsonNode analysis;
		try {
			analysis = objectMapper.readTree(record.analysisResult());
		} catch (Exception error) {
			return null;
		}

		JsonNode riskAssessment = analysis.get("riskAssessment");
		if (riskAssessment != null && riskAssessment.isObject()) {
			String level = textOrNull(riskAssessment.get("level"));
			if (level != null) {
				return new RepresentativeRisk(
					level,
					blankFallback(textOrNull(riskAssessment.get("basis")), "상담 내역 기반 위험 신호를 다시 확인할 필요가 있습니다."),
					dedupeSignals(riskAssessment.get("signals")),
					record.createdAt()
				);
			}
		}

		return new RepresentativeRisk(
			inferLegacyRiskLevel(analysis),
			firstNonBlank(
				firstIssueDetail(analysis),
				textOrNull(analysis.get("summary")),
				"상담 내역 기반 위험 신호를 다시 확인할 필요가 있습니다."
			),
			dedupeSignalsFromLegacy(analysis),
			record.createdAt()
		);
	}

	private String inferLegacyRiskLevel(JsonNode analysis) {
		String corpus = buildLegacyCorpus(analysis).toLowerCase(Locale.ROOT);
		int highMatches = (int) java.util.Arrays.stream(HIGH_RISK_PATTERNS).filter(pattern -> pattern.matcher(corpus).find()).count();
		int mediumMatches = (int) java.util.Arrays.stream(MEDIUM_RISK_PATTERNS).filter(pattern -> pattern.matcher(corpus).find()).count();
		if (highMatches > 0 || mediumMatches >= 3) return "high";
		if (mediumMatches > 0 || issueCount(analysis) > 0) return "medium";
		return "low";
	}

	private String buildLegacyCorpus(JsonNode analysis) {
		List<String> parts = new ArrayList<>();
		addIfNotBlank(parts, textOrNull(analysis.get("summary")));
		addIfNotBlank(parts, textOrNull(analysis.path("member").get("emotion")));
		JsonNode issues = analysis.get("issues");
		if (issues != null && issues.isArray()) {
			issues.forEach(issue -> {
				addIfNotBlank(parts, textOrNull(issue.get("title")));
				addIfNotBlank(parts, textOrNull(issue.get("detail")));
			});
		}
		addArrayTexts(parts, analysis.path("actions").get("mentor"));
		addArrayTexts(parts, analysis.path("actions").get("member"));
		addArrayTexts(parts, analysis.path("actions").get("nextSession"));
		addArrayTexts(parts, analysis.get("keywords"));
		return String.join(" ", parts);
	}

	private int issueCount(JsonNode analysis) {
		JsonNode issues = analysis.get("issues");
		return issues != null && issues.isArray() ? issues.size() : 0;
	}

	private String firstIssueDetail(JsonNode analysis) {
		JsonNode issues = analysis.get("issues");
		if (issues != null && issues.isArray()) {
			for (JsonNode issue : issues) {
				String detail = textOrNull(issue.get("detail"));
				if (detail != null) return detail;
			}
		}
		return null;
	}

	private List<String> dedupeSignals(JsonNode node) {
		List<String> values = new ArrayList<>();
		if (node != null && node.isArray()) {
			node.forEach(item -> {
				String text = textOrNull(item);
				if (text != null) values.add(text);
			});
		}
		return dedupeNonEmpty(values).stream().limit(3).toList();
	}

	private List<String> dedupeSignalsFromLegacy(JsonNode analysis) {
		List<String> values = new ArrayList<>();
		addArrayTexts(values, analysis.get("keywords"));
		JsonNode issues = analysis.get("issues");
		if (issues != null && issues.isArray()) {
			issues.forEach(issue -> {
				String title = textOrNull(issue.get("title"));
				if (title != null) values.add(title);
			});
		}
		return dedupeNonEmpty(values).stream().limit(3).toList();
	}

	private List<String> dedupeNonEmpty(List<String> values) {
		return new ArrayList<>(new LinkedHashSet<>(values.stream().map(String::trim).filter(value -> !value.isEmpty()).toList()));
	}

	private void addArrayTexts(List<String> target, JsonNode node) {
		if (node != null && node.isArray()) {
			node.forEach(item -> addIfNotBlank(target, textOrNull(item)));
		}
	}

	private void addIfNotBlank(List<String> target, String value) {
		if (value != null && !value.isBlank()) {
			target.add(value);
		}
	}

	private String textOrNull(JsonNode node) {
		if (node == null || node.isNull()) return null;
		String value = node.asText();
		if (value == null) return null;
		String trimmed = value.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}

	private String blankFallback(String value, String fallback) {
		return value == null || value.isBlank() ? fallback : value;
	}

	private String firstNonBlank(String... values) {
		for (String value : values) {
			if (value != null && !value.isBlank()) return value;
		}
		return null;
	}

	private record RepresentativeRisk(String level, String basis, List<String> signals, java.time.OffsetDateTime createdAt) {}
}
