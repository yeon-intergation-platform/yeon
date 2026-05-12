package world.yeon.backend.counseling_record_ai.controller;

import java.util.UUID;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;
import world.yeon.backend.counseling_record_ai.dto.AnalyzeTrendRequest;
import world.yeon.backend.counseling_record_ai.service.CounselingRecordAiService;
import world.yeon.backend.counseling_record_ai.service.CounselingRecordAiServiceException;
import world.yeon.backend.counseling_record_details.service.CounselingRecordDetailServiceException;

@RestController
public class CounselingRecordAiController {
	private final CounselingRecordAiService service;

	public CounselingRecordAiController(CounselingRecordAiService service) {
		this.service = service;
	}

	@PostMapping(path = "/counseling-records/analyze-trend", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
	public ResponseEntity<StreamingResponseBody> analyzeTrend(
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@RequestBody AnalyzeTrendRequest request
	) {
		if (request == null) {
			throw new IllegalArgumentException("요청 본문이 필요합니다.");
		}
		StreamingResponseBody body = outputStream -> service.streamTrendAnalysis(userId, request.recordIds(), outputStream);
		return ResponseEntity.ok()
			.header(HttpHeaders.CONTENT_TYPE, MediaType.TEXT_EVENT_STREAM_VALUE)
			.header(HttpHeaders.CACHE_CONTROL, "no-cache")
			.body(body);
	}

	@ExceptionHandler(CounselingRecordAiServiceException.class)
	public ResponseEntity<ErrorResponse> handleServiceError(CounselingRecordAiServiceException error) {
		return ResponseEntity.status(error.status()).body(new ErrorResponse(error.code(), error.getMessage()));
	}

	@ExceptionHandler(CounselingRecordDetailServiceException.class)
	public ResponseEntity<ErrorResponse> handleDetailServiceError(CounselingRecordDetailServiceException error) {
		return ResponseEntity.status(error.status()).body(new ErrorResponse(error.code(), error.getMessage()));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ErrorResponse> handleBadRequest(IllegalArgumentException error) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("INVALID_REQUEST", error.getMessage()));
	}

	public record ErrorResponse(String code, String message) {}
}
