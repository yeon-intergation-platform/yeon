package world.yeon.backend.counseling_record_create.controller;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import world.yeon.backend.counseling_record_create.service.CounselingRecordCreateService;
import world.yeon.backend.counseling_record_create.service.CounselingRecordCreateServiceException;
import world.yeon.backend.counseling_record_details.dto.CounselingRecordDetailItemResponse;

@RestController
public class CounselingRecordCreateController {
	private final CounselingRecordCreateService service;

	public CounselingRecordCreateController(CounselingRecordCreateService service) {
		this.service = service;
	}

	@PostMapping(path = "/counseling-records", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public CounselingRecordCreateResponse create(
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@RequestHeader(value = "X-Yeon-User-Email", required = false) String userEmail,
		@RequestHeader(value = "X-Yeon-User-Display-Name", required = false) String userDisplayName,
		@RequestHeader(value = "X-Client-Request-Id", required = false) String clientRequestId,
		@RequestParam(value = "recordType", required = false) String recordType,
		@RequestParam(value = "sessionTitle", required = false) String sessionTitle,
		@RequestParam(value = "content", required = false) String content,
		@RequestParam(value = "studentName", required = false) String studentName,
		@RequestParam(value = "memberId", required = false) String memberId,
		@RequestParam(value = "counselingType", required = false) String counselingType,
		@RequestParam(value = "audioDurationMs", required = false) Long audioDurationMs,
		@RequestParam(value = "audio", required = false) MultipartFile audio
	) {
		return new CounselingRecordCreateResponse(service.create(new CounselingRecordCreateService.CreateRequest(
			userId,
			userEmail,
			userDisplayName,
			clientRequestId,
			recordType,
			sessionTitle,
			content,
			studentName,
			memberId,
			counselingType,
			audioDurationMs,
			audio
		)));
	}

	@ExceptionHandler(CounselingRecordCreateServiceException.class)
	public ResponseEntity<ErrorResponse> handleServiceError(CounselingRecordCreateServiceException error) {
		return ResponseEntity.status(error.status()).body(new ErrorResponse(error.code(), error.getMessage()));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ErrorResponse> handleBadRequest(IllegalArgumentException error) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("INVALID_REQUEST", error.getMessage()));
	}

	public record CounselingRecordCreateResponse(CounselingRecordDetailItemResponse record) {}
	public record ErrorResponse(String code, String message) {}
}
