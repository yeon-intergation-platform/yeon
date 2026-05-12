package world.yeon.backend.counseling_record_transcription.controller;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.counseling_record_details.dto.CounselingRecordDetailItemResponse;
import world.yeon.backend.counseling_record_transcription.service.CounselingRecordTranscriptionService;
import world.yeon.backend.counseling_record_transcription.service.CounselingRecordTranscriptionServiceException;

@RestController
public class CounselingRecordTranscriptionController {
	private final CounselingRecordTranscriptionService service;

	public CounselingRecordTranscriptionController(CounselingRecordTranscriptionService service) {
		this.service = service;
	}

	@PostMapping("/counseling-records/{recordId}/transcribe")
	public CounselingRecordTranscriptionResponse retryTranscription(
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@PathVariable String recordId,
		@RequestHeader(value = "X-Client-Request-Id", required = false) String clientRequestId
	) {
		return new CounselingRecordTranscriptionResponse(service.retryTranscription(userId, recordId, clientRequestId));
	}

	@ExceptionHandler(CounselingRecordTranscriptionServiceException.class)
	public ResponseEntity<ErrorResponse> handleServiceError(CounselingRecordTranscriptionServiceException error) {
		return ResponseEntity.status(error.status()).body(new ErrorResponse(error.code(), error.getMessage()));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ErrorResponse> handleBadRequest(IllegalArgumentException error) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("INVALID_REQUEST", error.getMessage()));
	}

	public record CounselingRecordTranscriptionResponse(CounselingRecordDetailItemResponse record) {}
	public record ErrorResponse(String code, String message) {}
}
