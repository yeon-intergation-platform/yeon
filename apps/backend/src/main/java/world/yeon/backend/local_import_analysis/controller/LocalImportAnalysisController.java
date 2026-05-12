package world.yeon.backend.local_import_analysis.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
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
import world.yeon.backend.local_import_analysis.dto.ErrorResponse;
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
	public ResponseEntity<?> analyze(
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@RequestHeader(value = HttpHeaders.ACCEPT, required = false) String accept,
		@RequestParam(value = "file", required = false) MultipartFile file,
		@RequestParam(value = "draftId", required = false) String draftId,
		@RequestParam(value = "instruction", required = false) String instruction,
		@RequestParam(value = "previousResult", required = false) String previousResult,
		@RequestParam(value = "spaceId", required = false) String spaceId
	) {
		var request = new LocalImportAnalysisService.AnalysisRequest(file, draftId, instruction, previousResult, spaceId);
		if (accept != null && accept.contains(MediaType.TEXT_EVENT_STREAM_VALUE)) {
			return streamAnalyze(userId, request);
		}
		LocalAnalyzeResponse response = service.analyze(userId, request, null);
		return ResponseEntity.ok(response);
	}

	private ResponseEntity<StreamingResponseBody> streamAnalyze(UUID userId, LocalImportAnalysisService.AnalysisRequest request) {
		StreamingResponseBody body = outputStream -> {
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
				writeEvent(outputStream, java.util.Map.of("type", "error", "message", error.getMessage()));
			}
		};
		return ResponseEntity.ok()
			.header(HttpHeaders.CONTENT_TYPE, MediaType.TEXT_EVENT_STREAM_VALUE)
			.header(HttpHeaders.CACHE_CONTROL, "no-cache")
			.body(body);
	}

	private void writeEvent(java.io.OutputStream outputStream, Object event) {
		try {
			outputStream.write(("data: " + objectMapper.writeValueAsString(event) + "\n\n").getBytes(StandardCharsets.UTF_8));
			outputStream.flush();
		} catch (IOException error) {
			throw new IllegalStateException("분석 SSE 이벤트 전송에 실패했습니다.", error);
		}
	}

	@ExceptionHandler(LocalImportAnalysisException.class)
	public ResponseEntity<ErrorResponse> handleServiceError(LocalImportAnalysisException error) {
		return ResponseEntity.status(error.status()).body(new ErrorResponse(error.code(), error.getMessage()));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ErrorResponse> handleBadRequest(IllegalArgumentException error) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("INVALID_REQUEST", error.getMessage()));
	}
}
