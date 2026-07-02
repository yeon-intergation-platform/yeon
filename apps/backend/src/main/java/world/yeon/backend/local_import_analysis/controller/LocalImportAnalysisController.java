package world.yeon.backend.local_import_analysis.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.UUID;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;
import world.yeon.backend.common.error.ApiErrorResponse;
import world.yeon.backend.common.error.ApiErrorResponses;
import world.yeon.backend.local_import_analysis.dto.LocalAnalyzeResponse;
import world.yeon.backend.local_import_analysis.service.LocalImportAnalysisException;
import world.yeon.backend.local_import_analysis.service.LocalImportAnalysisService;

@Validated
@RestController
public class LocalImportAnalysisController {
	private final LocalImportAnalysisService service;
	private final ObjectMapper objectMapper = new ObjectMapper();

	public LocalImportAnalysisController(LocalImportAnalysisService service) {
		this.service = service;
	}

	@PostMapping(path = "/integrations/local/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<LocalAnalyzeResponse> analyze(
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@RequestParam(value = "file", required = false) MultipartFile file,
		@RequestParam(value = "draftId", required = false) String draftId,
		@RequestParam(value = "instruction", required = false) String instruction,
		@RequestParam(value = "previousResult", required = false) String previousResult,
		@RequestParam(value = "spaceId", required = false) String spaceId
	) {
		LocalAnalyzeResponse response = service.analyze(userId, toAnalysisRequest(file, draftId, instruction, previousResult, spaceId), null);
		return ResponseEntity.ok(response);
	}

	@PostMapping(path = "/integrations/local/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, headers = "Accept=text/event-stream")
	public StreamingResponseBody streamAnalyze(
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		HttpServletRequest servletRequest,
		HttpServletResponse servletResponse,
		@RequestParam(value = "file", required = false) MultipartFile file,
		@RequestParam(value = "draftId", required = false) String draftId,
		@RequestParam(value = "instruction", required = false) String instruction,
		@RequestParam(value = "previousResult", required = false) String previousResult,
		@RequestParam(value = "spaceId", required = false) String spaceId
	) {
		servletResponse.setContentType(MediaType.TEXT_EVENT_STREAM_VALUE);
		servletResponse.setCharacterEncoding(StandardCharsets.UTF_8.name());
		servletResponse.setHeader(HttpHeaders.CACHE_CONTROL, "no-cache");
		LocalImportAnalysisService.AnalysisRequest request = toAnalysisRequest(file, draftId, instruction, previousResult, spaceId);
		return outputStream -> {
			try {
				LocalAnalyzeResponse response = service.analyze(userId, request, progress -> writeEvent(outputStream, java.util.Map.of(
					"type", "progress",
					"text", progress.message(),
					"stage", progress.stage(),
					"progress", progress.progress()
				)));
				java.util.Map<String, Object> done = new java.util.LinkedHashMap<>();
				done.put("type", "done");
				done.put("preview", response.preview());
				done.put("assistantMessage", response.assistantMessage());
				writeEvent(outputStream, done);
			} catch (LocalImportAnalysisException error) {
				writeEvent(outputStream, toErrorEvent(ApiErrorResponses.of(servletRequest, error.code(), error.getMessage())));
			}
		};
	}

	private static LocalImportAnalysisService.AnalysisRequest toAnalysisRequest(
		MultipartFile file,
		String draftId,
		String instruction,
		String previousResult,
		String spaceId
	) {
		return new LocalImportAnalysisService.AnalysisRequest(file, draftId, instruction, previousResult, spaceId);
	}

	private void writeEvent(java.io.OutputStream outputStream, Object event) {
		try {
			outputStream.write(("data: " + objectMapper.writeValueAsString(event) + "\n\n").getBytes(StandardCharsets.UTF_8));
			outputStream.flush();
		} catch (IOException error) {
			throw new IllegalStateException("분석 SSE 이벤트 전송에 실패했습니다.", error);
		}
	}

	private static java.util.Map<String, Object> toErrorEvent(ApiErrorResponse error) {
		java.util.Map<String, Object> event = new LinkedHashMap<>();
		event.put("type", "error");
		event.put("code", error.code());
		event.put("message", error.message());
		event.put("requestId", error.requestId());
		if (error.details() != null) event.put("details", error.details());
		if (error.currentState() != null) event.put("currentState", error.currentState());
		if (error.requiredState() != null) event.put("requiredState", error.requiredState());
		if (error.failedCondition() != null) event.put("failedCondition", error.failedCondition());
		if (error.blockedAction() != null) event.put("blockedAction", error.blockedAction());
		if (error.actionGuide() != null) event.put("actionGuide", error.actionGuide());
		return event;
	}

	@ExceptionHandler(LocalImportAnalysisException.class)
	public ResponseEntity<ApiErrorResponse> handleServiceError(LocalImportAnalysisException error) {
		return ResponseEntity.status(error.status()).body(ApiErrorResponses.ofCurrentRequest(error.code(), error.getMessage()));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ApiErrorResponse> handleBadRequest(IllegalArgumentException error) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiErrorResponses.ofCurrentRequest("INVALID_REQUEST", error.getMessage()));
	}
}
