package world.yeon.backend.counseling_record_details.controller;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.counseling_record_details.dto.CounselingRecordDetailItemResponse;
import world.yeon.backend.counseling_record_details.dto.CounselingRecordDetailsRequest;
import world.yeon.backend.counseling_record_details.dto.CounselingRecordDetailsResponse;
import world.yeon.backend.counseling_record_details.dto.CounselingRecordTrendSourcesRequest;
import world.yeon.backend.counseling_record_details.dto.CounselingRecordTrendSourcesResponse;
import world.yeon.backend.counseling_record_details.service.CounselingRecordDetailService;
import world.yeon.backend.counseling_record_details.service.CounselingRecordDetailServiceException;
import world.yeon.backend.common.error.ApiErrorResponse;
import world.yeon.backend.common.error.ApiErrorResponses;

@RestController
public class CounselingRecordDetailController {
	private final CounselingRecordDetailService service;

	public CounselingRecordDetailController(CounselingRecordDetailService service) {
		this.service = service;
	}

	@PostMapping("/counseling-records/details")
	public CounselingRecordDetailsResponse getDetails(
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@RequestBody CounselingRecordDetailsRequest request
	) {
		return service.getDetails(userId, request.recordIds());
	}

	@PostMapping("/counseling-records/trend-source")
	public CounselingRecordTrendSourcesResponse getTrendSources(
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@RequestBody CounselingRecordTrendSourcesRequest request
	) {
		return service.getTrendSources(userId, request.recordIds());
	}

	@GetMapping("/counseling-records/{recordId}")
	public CounselingRecordDetailResponse getDetail(
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@PathVariable String recordId
	) {
		return new CounselingRecordDetailResponse(service.getDetail(userId, recordId));
	}

	@ExceptionHandler(CounselingRecordDetailServiceException.class)
	public ResponseEntity<ApiErrorResponse> handleServiceError(CounselingRecordDetailServiceException error) {
		return ResponseEntity.status(error.status()).body(ApiErrorResponses.ofCurrentRequest(error.code(), error.getMessage()));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ApiErrorResponse> handleBadRequest(IllegalArgumentException error) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiErrorResponses.ofCurrentRequest("INVALID_REQUEST", error.getMessage()));
	}

	public record CounselingRecordDetailResponse(CounselingRecordDetailItemResponse record) {}
}
