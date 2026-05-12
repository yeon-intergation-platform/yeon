package world.yeon.backend.counseling_record_ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import world.yeon.backend.counseling_record_ai.dto.CounselingChatMessageRequest;
import world.yeon.backend.counseling_record_ai.dto.CounselingChatRequest;
import world.yeon.backend.counseling_record_ai.repository.CounselingRecordAiRepository;
import world.yeon.backend.counseling_record_details.dto.CounselingRecordDetailItemResponse;
import world.yeon.backend.counseling_record_details.dto.CounselingRecordTranscriptSegmentResponse;
import world.yeon.backend.counseling_record_details.dto.CounselingRecordTrendSegmentResponse;
import world.yeon.backend.counseling_record_details.dto.CounselingRecordTrendSourceItemResponse;
import world.yeon.backend.counseling_record_details.dto.CounselingRecordTrendSourcesResponse;
import world.yeon.backend.counseling_record_details.service.CounselingRecordDetailService;

@Service
public class CounselingRecordAiService {
	private static final String OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";
	private static final String OPENAI_RESPONSES_API_URL = "https://api.openai.com/v1/responses";
	private static final String DEFAULT_AI_CHAT_MODEL = "gpt-4.1-mini";
	private static final String DEFAULT_WEB_SEARCH_MODEL = "gpt-5.4-mini";

	private final CounselingRecordDetailService detailService;
	private final CounselingRecordAiRepository repository;
	private final ObjectMapper objectMapper;
	private final Environment environment;
	private final HttpClient httpClient = HttpClient.newHttpClient();

	public CounselingRecordAiService(
		CounselingRecordDetailService detailService,
		CounselingRecordAiRepository repository,
		ObjectMapper objectMapper,
		Environment environment
	) {
		this.detailService = detailService;
		this.repository = repository;
		this.objectMapper = objectMapper;
		this.environment = environment;
	}


	public JsonNode runRecordAnalysis(UUID userId, String recordPublicId) throws IOException {
		CounselingRecordDetailItemResponse detail = detailService.getDetail(userId, recordPublicId);
		if (!"ready".equals(detail.status()) || detail.transcriptSegments().isEmpty()) {
			throw new CounselingRecordAiServiceException(400, "COUNSELING_RECORD_NOT_READY", "전사가 완료된 레코드만 분석할 수 있습니다.");
		}
		if (detail.analysisResult() != null && "ready".equals(detail.analysisStatus())) {
			return detail.analysisResult();
		}
		if ("processing".equals(detail.analysisStatus())) {
			throw new CounselingRecordAiServiceException(409, "COUNSELING_ANALYSIS_PROCESSING", "AI 분석이 이미 진행 중입니다. 잠시 후 새로고침해 주세요.");
		}

		repository.markAnalysisProcessing(userId, recordPublicId);
		try {
			JsonNode result = requestAnalysisResult(detail);
			repository.saveAnalysisResult(userId, recordPublicId, objectMapper.writeValueAsString(result));
			return result;
		} catch (CounselingRecordAiServiceException error) {
			repository.saveAnalysisError(userId, recordPublicId, error.getMessage());
			throw error;
		} catch (Exception error) {
			repository.saveAnalysisError(userId, recordPublicId, "AI 분석에 실패했습니다.");
			throw error;
		}
	}

	public void streamRecordChat(UUID userId, String recordPublicId, CounselingChatRequest request, OutputStream outputStream) throws IOException {
		validateChatRequest(request);
		CounselingChatMessageRequest lastMessage = request.messages().getLast();
		String userContent = lastMessage.content().trim();
		CounselingRecordDetailItemResponse detail = detailService.getDetail(userId, recordPublicId);

		appendMessages(userId, recordPublicId, List.of(chatMessage("user", userContent)));

		if (request.shouldUseWebSearch()) {
			String content = resolveWebSearchChatText(request.messages());
			writeEvent(outputStream, objectMapper.writeValueAsString(Map.of("content", content)));
			writeEvent(outputStream, "[DONE]");
			appendMessages(userId, recordPublicId, List.of(chatMessage("assistant", content)));
			return;
		}

		String prompt = buildChatSystemPrompt(detail);
		Map<String, Object> body = new LinkedHashMap<>();
		body.put("model", resolveAiChatModel());
		body.put("stream", true);
		body.put("messages", buildChatMessages(prompt, request.messages()));

		HttpResponse<java.io.InputStream> response = requestChatCompletionStream(body, "AI 도우미가 응답하지 못했습니다.");
		String assistantContent = transformOpenAiStream(response.body(), outputStream).trim();
		if (!assistantContent.isEmpty()) {
			appendMessages(userId, recordPublicId, List.of(chatMessage("assistant", assistantContent)));
		}
	}

	public void clearRecordChat(UUID userId, String recordPublicId) {
		int updated = repository.clearAssistantMessages(userId, recordPublicId);
		if (updated == 0) {
			throw new CounselingRecordAiServiceException(404, "COUNSELING_RECORD_NOT_FOUND", "상담 기록을 찾지 못했습니다.");
		}
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
		body.put("model", resolveAiChatModel());
		body.put("stream", true);
		body.put("messages", List.of(
			Map.of("role", "system", "content", prompt),
			Map.of("role", "user", "content", "위 상담 기록들을 바탕으로 수강생의 변화 추이를 분석해주세요.")
		));

		HttpResponse<java.io.InputStream> response = requestChatCompletionStream(body, "추이 분석 AI가 응답하지 못했습니다.");
		transformOpenAiStream(response.body(), outputStream);
	}


	private JsonNode requestAnalysisResult(CounselingRecordDetailItemResponse detail) throws IOException {
		Map<String, Object> body = new LinkedHashMap<>();
		body.put("model", resolveAiChatModel());
		body.put("temperature", 0.2);
		body.put("response_format", Map.of("type", "json_object"));
		body.put("messages", List.of(
			Map.of("role", "system", "content", buildAnalysisSystemPrompt(detail)),
			Map.of("role", "user", "content", "위 상담 기록을 분석하여 JSON으로 반환하세요.")
		));

		try {
			HttpRequest request = HttpRequest.newBuilder(URI.create(OPENAI_CHAT_COMPLETIONS_URL))
				.header("content-type", "application/json")
				.header("authorization", "Bearer " + resolveOpenAiApiKey())
				.POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
				.build();
			HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
			if (response.statusCode() < 200 || response.statusCode() >= 300) {
				throw new CounselingRecordAiServiceException(
					response.statusCode() >= 500 ? 502 : response.statusCode(),
					"OPENAI_ANALYSIS_FAILED",
					extractOpenAiErrorMessage(response.body(), "AI 분석에 실패했습니다.")
				);
			}
			String raw = objectMapper.readTree(response.body()).path("choices").path(0).path("message").path("content").asText(null);
			if (raw == null || raw.isBlank()) {
				throw new CounselingRecordAiServiceException(502, "OPENAI_ANALYSIS_EMPTY", "AI 분석 응답이 비어 있습니다.");
			}
			JsonNode result = objectMapper.readTree(raw);
			validateAnalysisResult(result);
			return result;
		} catch (InterruptedException error) {
			Thread.currentThread().interrupt();
			throw new CounselingRecordAiServiceException(500, "OPENAI_ANALYSIS_INTERRUPTED", "AI 분석 호출이 중단되었습니다.");
		}
	}

	private void validateAnalysisResult(JsonNode result) {
		if (!result.hasNonNull("summary") || !result.has("member") || !result.has("issues") || !result.has("actions") || !result.has("keywords")) {
			throw new CounselingRecordAiServiceException(502, "OPENAI_ANALYSIS_SCHEMA_INVALID", "AI 분석 응답이 예상 스키마와 다릅니다.");
		}
	}

	private String buildAnalysisSystemPrompt(CounselingRecordDetailItemResponse detail) {
		String transcriptBlock = buildTranscriptBlock(detail.transcriptSegments());
		String diarizationGuide = hasDiarization(detail.transcriptSegments()) ? "" : "\n화자 분리가 수행되지 않아 전체가 하나의 원문으로 제공됩니다. 대화 맥락을 바탕으로 멘토와 수강생의 발화를 추론하세요.";
		return """
			당신은 부트캠프/교육 프로그램 상담 기록 분석 전문 AI입니다.

			## 역할
			멘토/운영자가 업로드한 상담 녹음의 전사 원문을 분석하여 구조화된 JSON으로 반환합니다.
			항상 원문에 근거하고, 원문에 없는 내용을 지어내지 않습니다.
			대상은 20~30대 성인 수강생입니다.
			%s

			## 현재 상담 기록
			- 수강생: %s
			- 상담 제목: %s
			- 상담 유형: %s
			- 기록 일시: %s

			## 상담 원문 전사
			%s

			## 응답 규칙
			- 한국어로 작성합니다.
			- 원문 인용 시 타임스탬프를 포함합니다 (예: "[01:23]").
			- 반드시 아래 JSON 스키마를 따릅니다:

			{
			  "summary": "3-4문장의 핵심 요약",
			  "member": {
			    "name": "원문에서 파악된 수강생 이름 (없으면 null)",
			    "traits": ["성격", "학습 스타일", "현재 상황 등 관찰 특징"],
			    "emotion": "상담 중 드러난 감정/태도 변화 요약"
			  },
			  "issues": [
			    {
			      "title": "이슈 제목",
			      "detail": "상세 설명 (원문 인용 포함)",
			      "timestamp": "관련 타임스탬프 (없으면 null)"
			    }
			  ],
			  "actions": {
			    "mentor": ["멘토가 취해야 할 구체적 행동"],
			    "member": ["수강생에게 권하는 다음 단계"],
			    "nextSession": ["후속 상담에서 확인할 사항"]
			  },
			  "keywords": ["상담 핵심 키워드 3-5개"],
			  "riskAssessment": {
			    "level": "low | medium | high",
			    "basis": "왜 이 위험도로 판단했는지 원문 근거 기반 1-2문장 요약",
			    "signals": ["반복 결석", "과제 지연", "자신감 저하" 같은 핵심 위험 신호 1-3개]
			  }
			}

			## 위험도 분류 기준
			- low: 현재 큰 이탈 위험은 낮고 관찰 중심으로 충분합니다.
			- medium: 반복 확인이 필요한 경고 신호가 있으며 후속 상담/추적이 필요합니다.
			- high: 이탈, 중도 포기, 심한 정서 저하, 지속적 수행 붕괴처럼 즉시 개입이 필요한 상태입니다.
			- riskAssessment는 반드시 포함합니다.
			- basis와 signals는 반드시 상담 원문에 근거해야 합니다.
			""".formatted(
			diarizationGuide,
			detail.studentName() == null || detail.studentName().isBlank() ? "(미지정)" : detail.studentName(),
			detail.sessionTitle(),
			detail.counselingType(),
			detail.createdAt(),
			transcriptBlock
		).stripIndent();
	}

	private void validateChatRequest(CounselingChatRequest request) {
		if (request == null || request.messages() == null || request.messages().isEmpty()) {
			throw new CounselingRecordAiServiceException(400, "COUNSELING_CHAT_MESSAGE_EMPTY", "메시지가 비어 있습니다.");
		}
		CounselingChatMessageRequest lastMessage = request.messages().getLast();
		if (lastMessage == null || !"user".equals(lastMessage.role()) || trimToNull(lastMessage.content()) == null) {
			throw new CounselingRecordAiServiceException(400, "COUNSELING_CHAT_LAST_MESSAGE_INVALID", "마지막 메시지는 사용자 메시지여야 합니다.");
		}
		for (CounselingChatMessageRequest message : request.messages()) {
			if (message == null || !("user".equals(message.role()) || "assistant".equals(message.role())) || message.content() == null) {
				throw new CounselingRecordAiServiceException(400, "COUNSELING_CHAT_MESSAGE_INVALID", "메시지 형식이 올바르지 않습니다.");
			}
		}
	}

	private List<Map<String, String>> buildChatMessages(String systemPrompt, List<CounselingChatMessageRequest> conversationMessages) {
		List<Map<String, String>> messages = new ArrayList<>();
		messages.add(Map.of("role", "system", "content", systemPrompt));
		for (CounselingChatMessageRequest message : conversationMessages) {
			messages.add(Map.of("role", message.role(), "content", message.content()));
		}
		return messages;
	}

	private String resolveWebSearchChatText(List<CounselingChatMessageRequest> messages) {
		try {
			Map<String, Object> body = new LinkedHashMap<>();
			body.put("model", resolveWebSearchModel());
			body.put("store", false);
			body.put("tool_choice", "required");
			body.put("tools", List.of(Map.of("type", "web_search", "external_web_access", true)));
			List<Map<String, String>> input = new ArrayList<>();
			input.add(Map.of("role", "developer", "content", buildWebSearchSystemPrompt()));
			for (CounselingChatMessageRequest message : messages) {
				input.add(Map.of("role", message.role(), "content", message.content()));
			}
			body.put("input", input);

			HttpRequest request = HttpRequest.newBuilder(URI.create(OPENAI_RESPONSES_API_URL))
				.timeout(Duration.ofSeconds(18))
				.header("content-type", "application/json")
				.header("authorization", "Bearer " + resolveOpenAiApiKey())
				.POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
				.build();

			HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
			if (response.statusCode() < 200 || response.statusCode() >= 300) {
				throw new CounselingRecordAiServiceException(
					response.statusCode() >= 500 ? 502 : response.statusCode(),
					"OPENAI_WEB_SEARCH_CHAT_FAILED",
					extractOpenAiErrorMessage(response.body(), "OpenAI Responses API가 요청을 처리하지 못했습니다.")
				);
			}
			WebSearchResult result = extractWebSearchResult(objectMapper.readTree(response.body()));
			if (!result.hasWebSearchCall() || result.citations().isEmpty() || result.text().isBlank()) {
				throw new CounselingRecordAiServiceException(502, "OPENAI_WEB_SEARCH_RESULT_INVALID", "웹 검색 응답에서 검색 결과 또는 출처를 확인하지 못했습니다.");
			}
			return result.text() + formatCitationsMarkdown(result.citations());
		} catch (Exception error) {
			return resolveGeneralChatText(messages);
		}
	}

	private String resolveGeneralChatText(List<CounselingChatMessageRequest> messages) {
		Map<String, Object> body = new LinkedHashMap<>();
		body.put("model", resolveAiChatModel());
		body.put("stream", false);
		body.put("messages", buildChatMessages(buildGeneralAiSystemPrompt(), messages));
		try {
			HttpRequest request = HttpRequest.newBuilder(URI.create(OPENAI_CHAT_COMPLETIONS_URL))
				.header("content-type", "application/json")
				.header("authorization", "Bearer " + resolveOpenAiApiKey())
				.POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
				.build();
			HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
			if (response.statusCode() < 200 || response.statusCode() >= 300) {
				throw new CounselingRecordAiServiceException(
					response.statusCode() >= 500 ? 502 : response.statusCode(),
					"OPENAI_GENERAL_CHAT_FAILED",
					extractOpenAiErrorMessage(response.body(), "일반 AI 도우미가 응답하지 못했습니다.")
				);
			}
			String content = objectMapper.readTree(response.body()).path("choices").path(0).path("message").path("content").asText(null);
			if (content == null || content.isBlank()) {
				throw new CounselingRecordAiServiceException(502, "OPENAI_GENERAL_CHAT_EMPTY", "일반 AI 응답이 비어 있습니다.");
			}
			return content;
		} catch (InterruptedException error) {
			Thread.currentThread().interrupt();
			throw new CounselingRecordAiServiceException(500, "OPENAI_GENERAL_CHAT_INTERRUPTED", "일반 AI 호출이 중단되었습니다.");
		} catch (IOException error) {
			throw new CounselingRecordAiServiceException(502, "OPENAI_GENERAL_CHAT_IO_FAILED", "일반 AI 호출에 실패했습니다.");
		}
	}

	private HttpResponse<java.io.InputStream> requestChatCompletionStream(Map<String, Object> body, String defaultErrorMessage) throws IOException {
		HttpRequest request = HttpRequest.newBuilder(URI.create(OPENAI_CHAT_COMPLETIONS_URL))
			.header("content-type", "application/json")
			.header("authorization", "Bearer " + resolveOpenAiApiKey())
			.POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
			.build();

		try {
			HttpResponse<java.io.InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
			if (response.statusCode() < 200 || response.statusCode() >= 300) {
				String message = extractOpenAiErrorMessage(new String(response.body().readAllBytes(), StandardCharsets.UTF_8), defaultErrorMessage);
				throw new CounselingRecordAiServiceException(
					response.statusCode() >= 500 ? 502 : response.statusCode(),
					"OPENAI_CHAT_COMPLETION_FAILED",
					message
				);
			}
			return response;
		} catch (InterruptedException error) {
			Thread.currentThread().interrupt();
			throw new CounselingRecordAiServiceException(500, "OPENAI_CHAT_COMPLETION_INTERRUPTED", "AI 호출이 중단되었습니다.");
		}
	}

	private String transformOpenAiStream(java.io.InputStream upstream, OutputStream outputStream) throws IOException {
		StringBuilder accumulated = new StringBuilder();
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
					return accumulated.toString();
				}

				try {
					JsonNode root = objectMapper.readTree(payload);
					String content = root.path("choices").path(0).path("delta").path("content").asText(null);
					if (content != null && !content.isEmpty()) {
						accumulated.append(content);
						writeEvent(outputStream, objectMapper.writeValueAsString(Map.of("content", content)));
					}
				} catch (Exception ignored) {
					// 파싱 불가능한 OpenAI chunk는 기존 Next 구현처럼 무시합니다.
				}
			}
			writeEvent(outputStream, "[DONE]");
			return accumulated.toString();
		}
	}

	private void writeEvent(OutputStream outputStream, String payload) throws IOException {
		outputStream.write(("data: " + payload + "\n\n").getBytes(StandardCharsets.UTF_8));
		outputStream.flush();
	}

	private void appendMessages(UUID userId, String recordPublicId, List<Map<String, String>> messages) throws IOException {
		int updated = repository.appendAssistantMessages(userId, recordPublicId, objectMapper.writeValueAsString(messages));
		if (updated == 0) {
			throw new CounselingRecordAiServiceException(404, "COUNSELING_RECORD_NOT_FOUND", "상담 기록을 찾지 못했습니다.");
		}
	}

	private Map<String, String> chatMessage(String role, String content) {
		return Map.of(
			"id", UUID.randomUUID().toString(),
			"role", role,
			"content", content,
			"createdAt", Instant.now().toString()
		);
	}

	private String buildChatSystemPrompt(CounselingRecordDetailItemResponse detail) {
		String transcriptBlock = buildTranscriptBlock(detail.transcriptSegments());
		String diarizationGuide = hasDiarization(detail.transcriptSegments()) ? "" : """

			## 화자 분리 안내
			이 녹음은 화자 분리가 수행되지 않아 전체가 하나의 원문으로 제공됩니다.
			대화 맥락(질문↔응답, 존댓말↔반말, 호칭 등)을 바탕으로 멘토와 수강생의 발화를 추론하여 분석에 반영하세요.""";

		return """
			당신은 부트캠프/교육 프로그램 상담 기록 분석 전문 AI 도우미입니다.

			## 역할
			- 멘토/운영자가 업로드한 상담 녹음의 전사 원문을 바탕으로 분석, 요약, 후속 조치 제안을 합니다.
			- 항상 원문에 근거해 답변하고, 원문에 없는 내용을 지어내지 않습니다.
			- 실무에 바로 쓸 수 있는 구체적이고 실용적인 답변을 합니다.
			- 대상은 20~30대 성인 수강생입니다. 학교/초중고 맥락이 아닙니다.

			## 현재 상담 기록 정보
			- 수강생: %s
			- 상담 제목: %s
			- 상담 유형: %s
			- 기록 일시: %s
			%s

			## 상담 원문 전사
			%s

			## 응답 가이드라인
			- 한국어로 답변합니다.
			- 첫 문단은 쉬운 표현으로 짧고 간단하게 요약합니다.
			- 사용자가 더 자세한 설명을 원할 때만, 다음 문단에서 근거 인용과 실행 제안을 덧붙입니다.
			- 마크다운 서식을 자유롭게 사용합니다 (볼드, 리스트, 헤딩 등).
			- 핵심을 먼저 말하고, 근거를 원문 인용으로 뒷받침합니다.
			- 원문 인용 시 타임스탬프를 함께 표기합니다.
			- 불필요하게 길게 쓰지 말고, 멘토가 바로 활용할 수 있는 수준으로 정리합니다.
			""".formatted(
			detail.studentName() == null || detail.studentName().isBlank() ? "(미지정)" : detail.studentName(),
			detail.sessionTitle(),
			detail.counselingType(),
			detail.createdAt(),
			diarizationGuide,
			transcriptBlock
		).stripIndent();
	}

	private boolean hasDiarization(List<CounselingRecordTranscriptSegmentResponse> segments) {
		return segments.stream().anyMatch(segment -> !"원문".equals(segment.speakerLabel()) && !"unknown".equals(segment.speakerLabel()));
	}

	private String buildWebSearchSystemPrompt() {
		return """
			당신은 한국어로 답하는 웹 검색형 AI 도우미입니다.

			## 역할
			- 이번 모드에서는 반드시 웹 검색 도구를 사용한 뒤 답변합니다.
			- 사용자의 질문이 최신 정보와 직접 관련 없어 보여도 최소 1회는 웹 검색을 수행합니다.
			- 검색 결과를 바탕으로 답하되, 확실하지 않은 내용은 불확실성을 분명히 밝힙니다.

			## 응답 규칙
			- 한국어로 답변합니다.
			- 핵심부터 짧고 분명하게 설명합니다.
			- 불필요한 군더더기 없이 실용적으로 답합니다.
			- 답변 본문과 별도의 출처 목록은 서버가 후처리하므로, 본문은 자연스럽게 작성합니다.
			""".stripIndent();
	}

	private String buildGeneralAiSystemPrompt() {
		return """
			당신은 한국어로 답하는 일반 AI 도우미입니다.
			- 핵심부터 짧고 분명하게 설명합니다.
			- 필요할 때만 리스트나 마크다운을 사용합니다.
			- 모르는 내용은 아는 척하지 말고 한계를 분명히 밝힙니다.
			""".stripIndent();
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
				.append(buildTrendTranscriptBlock(record.segments()));
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

	private String buildTranscriptBlock(List<CounselingRecordTranscriptSegmentResponse> segments) {
		return segments.stream()
			.map(segment -> "[" + formatTimestamp(segment.startMs() == null ? 0 : segment.startMs()) + "] " + segment.speakerLabel() + ": " + segment.text())
			.reduce((a, b) -> a + "\n" + b)
			.orElse("");
	}

	private String buildTrendTranscriptBlock(List<CounselingRecordTrendSegmentResponse> segments) {
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

	private WebSearchResult extractWebSearchResult(JsonNode root) {
		List<String> outputTexts = new ArrayList<>();
		List<UrlCitation> citations = new ArrayList<>();
		boolean hasWebSearchCall = false;

		for (JsonNode item : root.path("output")) {
			String type = item.path("type").asText("");
			if ("web_search_call".equals(type)) {
				hasWebSearchCall = true;
				continue;
			}
			if (!"message".equals(type)) {
				continue;
			}
			for (JsonNode content : item.path("content")) {
				if (!"output_text".equals(content.path("type").asText(""))) {
					continue;
				}
				String text = content.path("text").asText("").trim();
				if (!text.isEmpty()) {
					outputTexts.add(text);
				}
				for (JsonNode annotation : content.path("annotations")) {
					if ("url_citation".equals(annotation.path("type").asText("")) && !annotation.path("url").asText("").isBlank()) {
						citations.add(new UrlCitation(annotation.path("url").asText(), annotation.path("title").asText(annotation.path("url").asText())));
					}
				}
			}
		}
		for (JsonNode source : root.path("sources")) {
			if (!source.path("url").asText("").isBlank()) {
				citations.add(new UrlCitation(source.path("url").asText(), source.path("title").asText(source.path("url").asText())));
			}
		}

		String text = root.path("output_text").asText("").trim();
		if (text.isEmpty()) {
			text = String.join("\n\n", outputTexts).trim();
		}
		return new WebSearchResult(text, dedupeUrlCitations(citations), hasWebSearchCall);
	}

	private List<UrlCitation> dedupeUrlCitations(List<UrlCitation> citations) {
		Set<String> seen = new LinkedHashSet<>();
		List<UrlCitation> unique = new ArrayList<>();
		for (UrlCitation citation : citations) {
			String url = citation.url().trim();
			if (!url.isEmpty() && seen.add(url)) {
				String title = citation.title() == null || citation.title().isBlank() ? url : citation.title().trim();
				unique.add(new UrlCitation(url, title));
			}
		}
		return unique;
	}

	private String formatCitationsMarkdown(List<UrlCitation> citations) {
		if (citations.isEmpty()) {
			return "";
		}
		return "\n\n---\n\n**출처**\n" + citations.stream()
			.map(citation -> "- [" + citation.title() + "](" + citation.url() + ")")
			.reduce((a, b) -> a + "\n" + b)
			.orElse("");
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

	private String resolveAiChatModel() {
		String value = trimToNull(environment.getProperty("OPENAI_AI_CHAT_MODEL"));
		if (value == null) {
			value = trimToNull(System.getenv("OPENAI_AI_CHAT_MODEL"));
		}
		return value == null ? DEFAULT_AI_CHAT_MODEL : value;
	}

	private String resolveWebSearchModel() {
		String value = trimToNull(environment.getProperty("OPENAI_WEB_SEARCH_MODEL"));
		if (value == null) {
			value = trimToNull(System.getenv("OPENAI_WEB_SEARCH_MODEL"));
		}
		return value == null ? DEFAULT_WEB_SEARCH_MODEL : value;
	}

	private String extractOpenAiErrorMessage(String raw, String fallback) {
		try {
			JsonNode root = objectMapper.readTree(raw);
			String message = root.path("error").path("message").asText(null);
			return message == null || message.isBlank() ? fallback : message;
		} catch (Exception ignored) {
			return fallback;
		}
	}

	private String trimToNull(String value) {
		if (value == null) return null;
		String trimmed = value.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}

	private record UrlCitation(String url, String title) {}
	private record WebSearchResult(String text, List<UrlCitation> citations, boolean hasWebSearchCall) {}
}
