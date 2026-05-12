package world.yeon.backend.local_import_analysis.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import world.yeon.backend.local_import_analysis.dto.LocalAnalyzeResponse;
import world.yeon.backend.local_import_analysis.repository.LocalImportAnalysisRepository;

@Service
public class LocalImportAnalysisService {
	public record AnalysisRequest(MultipartFile file, String draftId, String instruction, String previousResult, String spaceId) {}
	public record Progress(String stage, int progress, String message) {}
	public interface ProgressListener { void onProgress(Progress progress); }

	private static final int MAX_TEXT_CHARS = 80_000;
	private final LocalImportAnalysisRepository repository;
	private final ObjectMapper objectMapper;
	private final Environment environment;
	private final HttpClient httpClient = HttpClient.newHttpClient();

	public LocalImportAnalysisService(LocalImportAnalysisRepository repository, ObjectMapper objectMapper, Environment environment) {
		this.repository = repository;
		this.objectMapper = objectMapper;
		this.environment = environment;
	}

	public LocalAnalyzeResponse analyze(UUID userId, AnalysisRequest request, ProgressListener listener) {
		String activeDraftId = null;
		try {
			DraftPayload draftPayload = resolveDraftPayload(userId, request);
			activeDraftId = draftPayload.draftId();
			repository.markAnalyzing(userId, activeDraftId);
			String draftIdForProgress = activeDraftId;
			ProgressListener progressListener = progress -> {
				repository.saveProcessingState(userId, draftIdForProgress, progress.stage(), progress.progress(), progress.message());
				if (listener != null) listener.onProgress(progress);
			};
			AnalysisResult result = analyzePayload(draftPayload, request, progressListener);
			repository.savePreview(userId, activeDraftId, result.preview());
			return new LocalAnalyzeResponse(activeDraftId, result.preview(), result.assistantMessage());
		} catch (LocalImportAnalysisException error) {
			if (activeDraftId != null) repository.saveError(userId, activeDraftId, error.getMessage());
			throw error;
		} catch (Exception error) {
			if (activeDraftId != null) repository.saveError(userId, activeDraftId, "파일 분석에 실패했습니다.");
			throw new LocalImportAnalysisException(500, "LOCAL_ANALYZE_FAILED", "파일 분석에 실패했습니다.");
		}
	}

	private DraftPayload resolveDraftPayload(UUID userId, AnalysisRequest request) throws IOException {
		String requestedDraftId = trimToNull(request.draftId());
		if (requestedDraftId != null) {
			var draft = repository.getOwnedDraftSource(userId, requestedDraftId);
			if (draft == null) throw new LocalImportAnalysisException(404, "DRAFT_NOT_FOUND", "복구할 가져오기 초안을 찾지 못했습니다.");
			if (draft.bytes() == null) throw new LocalImportAnalysisException(400, "DRAFT_BYTES_MISSING", "원본 파일 바이트가 저장되지 않은 초안입니다.");
			return new DraftPayload(draft.publicId(), draft.fileName(), draft.mimeType(), draft.kind(), draft.bytes());
		}

		MultipartFile file = request.file();
		if (file == null || file.isEmpty()) throw new LocalImportAnalysisException(400, "LOCAL_ANALYZE_SOURCE_REQUIRED", "file 또는 draftId 필드가 필요합니다.");
		String fileName = file.getOriginalFilename() == null || file.getOriginalFilename().isBlank() ? "upload" : file.getOriginalFilename();
		String mimeType = file.getContentType() == null ? "" : file.getContentType();
		FileKind kind = FileKind.detect(fileName, mimeType);
		if (kind == FileKind.UNSUPPORTED) throw new LocalImportAnalysisException(400, "UNSUPPORTED_FILE_KIND", "지원하지 않는 파일 형식입니다.");
		byte[] bytes = file.getBytes();
		OffsetDateTime lastModifiedAt = null;
		String draftId = repository.createLocalDraft(userId, fileName, mimeType, kind, bytes.length, lastModifiedAt, bytes);
		return new DraftPayload(draftId, fileName, mimeType, kind, bytes);
	}

	private AnalysisResult analyzePayload(DraftPayload payload, AnalysisRequest request, ProgressListener listener) throws Exception {
		listener.onProgress(new Progress("loading_bytes", 22, loadingMessage(payload.kind())));
		String instruction = trimToNull(request.instruction());
		Object previousResult = parsePreviousResult(request.previousResult());
		boolean refine = instruction != null && previousResult != null;
		List<LocalImportAnalysisRepository.FieldHint> fieldHints = loadFieldHints(request.spaceId());

		if (payload.kind() == FileKind.IMAGE) {
			listener.onProgress(new Progress(refine ? "applying_refinement" : "ai_mapping", refine ? 84 : 74, refine ? "원본 이미지를 다시 해석하고 있습니다." : "이미지 표를 해석하고 있습니다."));
			AnalysisResult result = analyzeImageWithOpenAi(payload, instruction, previousResult, refine, fieldHints);
			listener.onProgress(new Progress("building_preview", 92, "이미지 분석 결과를 정리하고 있습니다."));
			return result;
		}

		String text = extractText(payload);
		if (payload.kind() == FileKind.PDF && text.isBlank()) {
			listener.onProgress(new Progress("building_preview", 92, "텍스트를 찾지 못한 PDF 결과를 정리하고 있습니다."));
			return new AnalysisResult(Map.of("cohorts", List.of()), null);
		}
		listener.onProgress(new Progress(refine ? "applying_refinement" : "ai_mapping", refine ? 84 : 74, refine ? "수정 요청을 AI가 반영하고 있습니다." : "AI가 데이터를 해석하고 있습니다."));
		AnalysisResult result = analyzeTextWithOpenAi(text, instruction, previousResult, refine, fieldHints);
		listener.onProgress(new Progress("building_preview", 92, "미리보기를 정리하고 있습니다."));
		return result;
	}

	private String extractText(DraftPayload payload) throws IOException {
		return switch (payload.kind()) {
			case SPREADSHEET -> extractSpreadsheetText(payload.bytes());
			case PDF -> extractPdfText(payload.bytes());
			case CSV, TXT -> new String(payload.bytes(), StandardCharsets.UTF_8);
			default -> throw new LocalImportAnalysisException(400, "UNSUPPORTED_FILE_KIND", "분석을 지원하지 않는 파일 형식입니다.");
		};
	}

	private String extractSpreadsheetText(byte[] bytes) throws IOException {
		DataFormatter formatter = new DataFormatter();
		StringBuilder out = new StringBuilder();
		try (var workbook = WorkbookFactory.create(new ByteArrayInputStream(bytes))) {
			for (Sheet sheet : workbook) {
				out.append("=== 시트: ").append(sheet.getSheetName()).append(" ===\n");
				for (Row row : sheet) {
					List<String> cells = new ArrayList<>();
					for (int idx = 0; idx < row.getLastCellNum(); idx += 1) cells.add(formatter.formatCellValue(row.getCell(idx)));
					out.append(String.join(",", cells)).append("\n");
					if (out.length() > MAX_TEXT_CHARS) return out.substring(0, MAX_TEXT_CHARS);
				}
				out.append("\n");
			}
		}
		return out.toString();
	}

	private String extractPdfText(byte[] bytes) {
		try (var document = Loader.loadPDF(bytes)) {
			return new PDFTextStripper().getText(document);
		} catch (Exception ignored) {
			return "";
		}
	}

	private AnalysisResult analyzeTextWithOpenAi(String content, String instruction, Object previousResult, boolean refine, List<LocalImportAnalysisRepository.FieldHint> fieldHints) throws IOException, InterruptedException {
		String userContent = truncate(content) + (refine ? "\n\n---\n이전 분석 결과:\n" + objectMapper.writeValueAsString(previousResult) + "\n\n사용자 보완 요청: " + instruction : "");
		Map<String, Object> body = Map.of(
			"model", resolveModel("OPENAI_AI_IMPORT_MODEL", "OPENAI_AI_CHAT_MODEL", "gpt-4.1-mini"),
			"messages", List.of(
				Map.of("role", "system", "content", buildTextSystemPrompt(refine, fieldHints)),
				Map.of("role", "user", "content", userContent)
			),
			"response_format", Map.of("type", "json_object"),
			"temperature", 0.1
		);
		return parseOpenAiAnalysis(callOpenAi(body), refine);
	}

	private AnalysisResult analyzeImageWithOpenAi(DraftPayload payload, String instruction, Object previousResult, boolean refine, List<LocalImportAnalysisRepository.FieldHint> fieldHints) throws IOException, InterruptedException {
		String base64 = Base64.getEncoder().encodeToString(payload.bytes());
		String prompt = buildImagePrompt(refine, fieldHints) + (refine ? "\n\n이전 분석 결과:\n" + objectMapper.writeValueAsString(previousResult) + "\n\n사용자 보완 요청: " + instruction : "");
		Map<String, Object> body = Map.of(
			"model", resolveModel("OPENAI_AI_VISION_MODEL", "OPENAI_AI_IMPORT_MODEL", "gpt-4.1-nano"),
			"messages", List.of(Map.of("role", "user", "content", List.of(
				Map.of("type", "image_url", "image_url", Map.of("url", "data:" + ((payload.mimeType() == null || payload.mimeType().isBlank()) ? "image/png" : payload.mimeType()) + ";base64," + base64)),
				Map.of("type", "text", "text", prompt)
			))),
			"response_format", Map.of("type", "json_object"),
			"temperature", 0.1
		);
		return parseOpenAiAnalysis(callOpenAi(body), refine);
	}

	private String callOpenAi(Map<String, Object> body) throws IOException, InterruptedException {
		String apiKey = trimToNull(environment.getProperty("OPENAI_API_KEY"));
		if (apiKey == null) apiKey = trimToNull(System.getenv("OPENAI_API_KEY"));
		if (apiKey == null) throw new LocalImportAnalysisException(500, "OPENAI_API_KEY_MISSING", "OPENAI_API_KEY가 설정되지 않았습니다.");
		HttpRequest request = HttpRequest.newBuilder(URI.create("https://api.openai.com/v1/chat/completions"))
			.header("content-type", "application/json")
			.header("authorization", "Bearer " + apiKey)
			.POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
			.build();
		HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
		if (response.statusCode() < 200 || response.statusCode() >= 300) throw new LocalImportAnalysisException(502, "OPENAI_REQUEST_FAILED", "OpenAI API 호출 실패: " + response.body());
		var root = objectMapper.readTree(response.body());
		String content = root.path("choices").path(0).path("message").path("content").asText(null);
		if (content == null || content.isBlank()) throw new LocalImportAnalysisException(500, "OPENAI_EMPTY_RESPONSE", "AI 응답이 비어 있습니다.");
		return content;
	}

	private AnalysisResult parseOpenAiAnalysis(String raw, boolean refine) throws IOException {
		Map<String, Object> parsed = objectMapper.readValue(raw, new TypeReference<>() {});
		Object cohorts = parsed.get("cohorts");
		if (!(cohorts instanceof List<?>)) throw new LocalImportAnalysisException(500, "OPENAI_RESPONSE_INVALID", "AI 응답 구조 검증 실패: cohorts 배열이 필요합니다.");
		Map<String, Object> preview = new LinkedHashMap<>();
		preview.put("cohorts", cohorts);
		Object message = parsed.get("message");
		return new AnalysisResult(preview, refine && message instanceof String text && !text.isBlank() ? text : null);
	}

	private String buildTextSystemPrompt(boolean refine, List<LocalImportAnalysisRepository.FieldHint> fieldHints) {
		return "아래 데이터에서 코호트/기수 정보와 수강생 목록을 추출해라. JSON 형식으로만 반환: { \"message\": " + (refine ? "\"사용자에게 보여줄 한국어 답변\"" : "null") + ", \"cohorts\": [{ \"name\": \"코호트명\", \"startDate\": null, \"endDate\": null, \"students\": [{ \"name\": \"이름\", \"email\": null, \"phone\": null, \"status\": \"active|withdrawn|graduated\", \"customFields\": {} }] }] }. status 기본값은 active. 근거 없는 창작 이름은 금지한다." + buildFieldHintPrompt(fieldHints) + (refine ? " 이전 분석 결과와 사용자 보완 요청을 반영하되, 질문만 있으면 cohorts는 유지하고 message로 설명해라." : "");
	}

	private String buildImagePrompt(boolean refine, List<LocalImportAnalysisRepository.FieldHint> fieldHints) {
		return "너는 이미지 형태의 표에서 수강생 데이터를 복원하는 추출기다. 원본 이미지에 보이는 행/열만 근거로 JSON을 반환해라. 형식: { \"message\": " + (refine ? "\"사용자에게 보여줄 한국어 답변\"" : "null") + ", \"cohorts\": [{ \"name\": \"코호트명\", \"startDate\": null, \"endDate\": null, \"students\": [{ \"name\": \"이름\", \"email\": null, \"phone\": null, \"status\": \"active\", \"customFields\": {} }] }] }. 보이는 열을 customFields에 최대한 보존해라." + buildFieldHintPrompt(fieldHints);
	}

	private String buildFieldHintPrompt(List<LocalImportAnalysisRepository.FieldHint> fieldHints) {
		if (fieldHints.isEmpty()) return "";
		return " 추가 커스텀 필드 목록: " + fieldHints.stream().map(h -> h.name() + "(" + h.fieldType() + ")").reduce((a, b) -> a + ", " + b).orElse("") + ".";
	}

	private List<LocalImportAnalysisRepository.FieldHint> loadFieldHints(String spaceId) {
		String normalized = trimToNull(spaceId);
		if (normalized == null) return List.of();
		try { return repository.listFieldHints(normalized); }
		catch (RuntimeException ignored) { return List.of(); }
	}

	private Object parsePreviousResult(String previousResult) {
		String normalized = trimToNull(previousResult);
		if (normalized == null) return null;
		try { return objectMapper.readValue(normalized, Object.class); }
		catch (IOException ignored) { return null; }
	}

	private String resolveModel(String primary, String secondary, String fallback) {
		String value = trimToNull(environment.getProperty(primary));
		if (value == null) value = trimToNull(environment.getProperty(secondary));
		return value == null ? fallback : value;
	}
	private String truncate(String value) { return value.length() <= MAX_TEXT_CHARS ? value : value.substring(0, MAX_TEXT_CHARS); }
	private String trimToNull(String value) { return value == null || value.trim().isEmpty() ? null : value.trim(); }
	private String loadingMessage(FileKind kind) { return switch (kind) { case SPREADSHEET -> "스프레드시트 내용을 읽고 있습니다."; case PDF -> "PDF 내용을 읽고 있습니다."; case IMAGE -> "이미지 파일을 읽고 있습니다."; default -> "파일 내용을 읽고 있습니다."; }; }

	private record DraftPayload(String draftId, String fileName, String mimeType, FileKind kind, byte[] bytes) {}
	private record AnalysisResult(Object preview, String assistantMessage) {}
}
