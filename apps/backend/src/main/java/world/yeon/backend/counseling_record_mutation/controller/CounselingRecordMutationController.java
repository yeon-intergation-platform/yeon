package world.yeon.backend.counseling_record_mutation.controller;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.counseling_record_mutation.dto.BulkUpdateSpeakerRequest;
import world.yeon.backend.counseling_record_mutation.dto.BulkUpdateSpeakerResponse;
import world.yeon.backend.counseling_record_mutation.dto.LinkCounselingRecordRequest;
import world.yeon.backend.counseling_record_mutation.dto.MutationOkResponse;
import world.yeon.backend.counseling_record_mutation.dto.UpdateTranscriptSegmentRequest;
import world.yeon.backend.counseling_record_mutation.dto.UpdateTranscriptSegmentResponse;
import world.yeon.backend.counseling_record_mutation.service.CounselingRecordMutationService;
import world.yeon.backend.counseling_record_mutation.service.CounselingRecordMutationServiceException;

@RestController
public class CounselingRecordMutationController {
	private final CounselingRecordMutationService service;

	public CounselingRecordMutationController(CounselingRecordMutationService service) {
		this.service = service;
	}

	@PatchMapping("/counseling-records/{recordId}/link-member")
	public MutationOkResponse linkMember(
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@PathVariable String recordId,
		@RequestBody LinkCounselingRecordRequest request
	) {
		return service.linkRecord(userId, recordId, request.memberId());
	}

	@DeleteMapping("/counseling-records/{recordId}")
	public MutationOkResponse deleteRecord(
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@PathVariable String recordId
	) {
		return service.deleteRecord(userId, recordId);
	}

	@PatchMapping("/counseling-records/{recordId}/segments/{segmentId}")
	public UpdateTranscriptSegmentResponse updateSegment(
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@PathVariable String recordId,
		@PathVariable String segmentId,
		@RequestBody UpdateTranscriptSegmentRequest request
	) {
		return service.updateSegment(userId, recordId, segmentId, request);
	}

	@PatchMapping("/counseling-records/{recordId}/segments/bulk")
	public BulkUpdateSpeakerResponse bulkUpdateSpeaker(
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@PathVariable String recordId,
		@RequestBody BulkUpdateSpeakerRequest request
	) {
		if (request == null) {
			throw new IllegalArgumentException("요청 본문이 필요합니다.");
		}
		return service.bulkUpdateSpeaker(
			userId,
			recordId,
			request.fromSpeakerLabel(),
			request.toSpeakerLabel(),
			request.toSpeakerTone()
		);
	}

	@ExceptionHandler(CounselingRecordMutationServiceException.class)
	public ResponseEntity<ErrorResponse> handleServiceError(CounselingRecordMutationServiceException error) {
		return ResponseEntity.status(error.status()).body(new ErrorResponse(error.code(), error.getMessage()));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ErrorResponse> handleBadRequest(IllegalArgumentException error) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("INVALID_REQUEST", error.getMessage()));
	}

	public record ErrorResponse(String code, String message) {}
}
