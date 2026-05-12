package world.yeon.backend.counseling_record_ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.OutputStream;
import java.io.StringReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import world.yeon.backend.counseling_record_details.dto.CounselingRecordTrendSegmentResponse;
import world.yeon.backend.counseling_record_details.dto.CounselingRecordTrendSourceItemResponse;
import world.yeon.backend.counseling_record_details.dto.CounselingRecordTrendSourcesResponse;
import world.yeon.backend.counseling_record_details.service.CounselingRecordDetailService;

@Service
public class CounselingRecordAiService {
	private static final String OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";
	private static final String DEFAULT_AI_CHAT_MODEL = "gpt-4.1-mini";

	private final CounselingRecordDetailService detailService;
	private final ObjectMapper objectMapper;
	private final Environment environment;
	private final HttpClient httpClient = HttpClient.newHttpClient();

	public CounselingRecordAiService(
		CounselingRecordDetailService detailService,
		ObjectMapper objectMapper,
		Environment environment
	) {
		this.detailService = detailService;
		this.objectMapper = objectMapper;
		this.environment = environment;
	}

	public void streamTrendAnalysis(UUID userId, List<String> recordIds, OutputStream outputStream) throws IOException {
		if (recordIds == null || recordIds.isEmpty()) {
			throw new CounselingRecordAiServiceException(400, "TREND_RECORD_IDS_EMPTY", "recordIds는 비어 있을 수 없습니다.");
		}

		CounselingRecordTrendSourcesResponse sources = detailService.getTrendSources(userId, recordIds);
		if (sources.records().isEmpty()) {
			throw new CounselingRecordAiServiceException(400, "TREND_RECORDS_EMPTY", "분석할 기록이 없습니다.");
		}

		String studentName = sources.records().getFirst().studentName();
		String prompt = buildTrendAnalysisSystemPrompt(studentName, sources.records());
		Map<String, Object> body = new LinkedHashMap<>();
		body.put("model", resolveModel());
		body.put("stream", true);
		body.put("messages", List.of(
			Map.of("role", "system", "content", prompt),
			Map.of("role", "user", "content", "위 상담 기록들을 바탕으로 수강생의 변화 추이를 분석해주세요.")
		));

		HttpRequest request = HttpRequest.newBuilder(URI.create(OPENAI_CHAT_COMPLETIONS_URL))
			.header("content-type", "application/json")
			.header("authorization", "Bearer " + resolveOpenAiApiKey())
			.POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
			.build();

		try {
			HttpResponse<java.io.InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
			if (response.statusCode() < 200 || response.statusCode() >= 300) {
				String message = extractOpenAiErrorMessage(new String(response.body().readAllBytes(), StandardCharsets.UTF_8));
				throw new CounselingRecordAiServiceException(
					response.statusCode() >= 500 ? 502 : response.statusCode(),
					"OPENAI_TREND_ANALYSIS_FAILED",
					message
				);
			}
			transformOpenAiStream(response.body(), outputStream);
		} catch (InterruptedException error) {
			Thread.currentThread().interrupt();
			throw new CounselingRecordAiServiceException(500, "OPENAI_TREND_ANALYSIS_INTERRUPTED", "추이 분석 AI 호출이 중단되었습니다.");
		}
	}

	private void transformOpenAiStream(java.io.InputStream upstream, OutputStream outputStream) throws IOException {
		try (BufferedReader reader = new BufferedReader(new java.io.InputStreamReader(upstream, StandardCharsets.UTF_8))) {
			String line;
			while ((line = reader.readLine()) != null) {
				String trimmed = line.trim();
				if (trimmed.isEmpty() || !trimmed.startsWith("data: ")) {
					continue;
				}

				String payload = trimmed.substring(6);
				if ("[DONE]".equals(payload)) {
					writeEvent(outputStream, "[DONE]");
					return;
				}

				JsonNode root = objectMapper.readTree(payload);
				String content = root.path("choices").path(0).path("delta").path("content").asText(null);
				if (content != null && !content.isEmpty()) {
					writeEvent(outputStream, objectMapper.writeValueAsString(Map.of("content", content)));
				}
			}
			writeEvent(outputStream, "[DONE]");
		}
	}

	private void writeEvent(OutputStream outputStream, String payload) throws IOException {
		outputStream.write(("data: " + payload + "\n\n").getBytes(StandardCharsets.UTF_8));
		outputStream.flush();
	}

	private String buildTrendAnalysisSystemPrompt(String studentName, List<CounselingRecordTrendSourceItemResponse> records) {
		StringBuilder recordBlocks = new StringBuilder();
		for (int i = 0; i < records.size(); i++) {
			CounselingRecordTrendSourceItemResponse record = records.get(i);
			if (i > 0) {
				recordBlocks.append("\n\n---\n\n");
			}
			recordBlocks
				.append("### ").append(i + 1).append("차 상담 (").append(record.createdAt()).append(")\n")
				.append("- 제목: ").append(record.sessionTitle()).append("\n")
				.append("- 유형: ").append(record.counselingType()).append("\n\n")
				.append(buildTranscriptBlock(record.segments()));
		}

		return """
			당신은 부트캠프/교육 프로그램 상담 기록 분석 전문 AI 도우미입니다.

			## 역할
			아래는 "%s" 수강생의 여러 차례 상담 원문입니다. 시간 순서로 수강생의 변화 추이, 반복되는 이슈, 개선된 점, 주의 필요 사항을 분석해주세요.

			## 상담 기록들
			%s

			## 응답 가이드라인
			- 한국어로 답변합니다.
			- 마크다운 서식을 자유롭게 사용합니다.
			- 다음 구조로 분석합니다:
			  1. **전체 추이 요약** — 수강생의 변화 흐름을 3-5문장으로 정리
			  2. **반복되는 이슈** — 여러 상담에 걸쳐 반복 등장하는 문제
			  3. **긍정적 변화** — 개선되거나 해소된 부분
			  4. **주의 필요 사항** — 악화 경향이나 새로 발견된 위험 신호
			  5. **후속 조치 제안** — 다음 상담 방향, 수강생에게 공유할 핵심 포인트
			- 원문 인용 시 몇 차 상담인지 표기합니다.
			- 불필요하게 길게 쓰지 않습니다.
			""".formatted(studentName, recordBlocks.toString()).stripIndent();
	}

	private String buildTranscriptBlock(List<CounselingRecordTrendSegmentResponse> segments) {
		return segments.stream()
			.map(segment -> "[" + formatTimestamp(segment.startMs()) + "] " + segment.speakerLabel() + ": " + segment.text())
			.reduce((a, b) -> a + "\n" + b)
			.orElse("");
	}

	private String formatTimestamp(int ms) {
		int totalSeconds = Math.max(0, ms) / 1000;
		int minutes = totalSeconds / 60;
		int seconds = totalSeconds % 60;
		return "%02d:%02d".formatted(minutes, seconds);
	}

	private String resolveOpenAiApiKey() {
		String value = trimToNull(environment.getProperty("OPENAI_API_KEY"));
		if (value == null) {
			value = trimToNull(System.getenv("OPENAI_API_KEY"));
		}
		if (value == null) {
			throw new CounselingRecordAiServiceException(500, "OPENAI_API_KEY_MISSING", "OPENAI_API_KEY가 설정되지 않았습니다.");
		}
		return value;
	}

	private String resolveModel() {
		String value = trimToNull(environment.getProperty("OPENAI_AI_CHAT_MODEL"));
		return value == null ? DEFAULT_AI_CHAT_MODEL : value;
	}

	private String extractOpenAiErrorMessage(String raw) {
		try {
			JsonNode root = objectMapper.readTree(raw);
			String message = root.path("error").path("message").asText(null);
			return message == null || message.isBlank() ? "추이 분석 AI가 응답하지 못했습니다." : message;
		} catch (Exception ignored) {
			return "추이 분석 AI가 응답하지 못했습니다.";
		}
	}

	private String trimToNull(String value) {
		if (value == null) return null;
		String trimmed = value.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}
}
