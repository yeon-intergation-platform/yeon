package world.yeon.backend.activity_logs.controller;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.activity_logs.dto.CreateActivityLogRequest;
import world.yeon.backend.activity_logs.dto.CreateActivityLogResponse;
import world.yeon.backend.activity_logs.dto.GetActivityLogsResponse;
import world.yeon.backend.activity_logs.service.ActivityLogService;
import world.yeon.backend.activity_logs.service.ActivityLogServiceException;
import world.yeon.backend.common.error.ApiErrorResponse;
import world.yeon.backend.common.error.ApiErrorResponses;

@Validated
@RestController
public class ActivityLogController {
	private final ActivityLogService service;

	public ActivityLogController(ActivityLogService service) {
		this.service = service;
	}

	@GetMapping("/spaces/{spaceId}/members/{memberId}/activity-logs")
	public GetActivityLogsResponse getActivityLogs(@PathVariable String spaceId, @PathVariable String memberId, @RequestHeader("X-Yeon-User-Id") UUID userId, @RequestParam(required = false) String type, @RequestParam(required = false) Integer limit) {
		return service.getActivityLogs(spaceId, memberId, userId, type, limit);
	}

	@PostMapping("/spaces/{spaceId}/members/{memberId}/activity-logs")
	public ResponseEntity<CreateActivityLogResponse> createMemoLog(@PathVariable String spaceId, @PathVariable String memberId, @RequestHeader("X-Yeon-User-Id") UUID userId, @RequestBody CreateActivityLogRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.createMemoLog(spaceId, memberId, userId, request));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ApiErrorResponse> handleBadRequest(IllegalArgumentException error) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiErrorResponses.ofCurrentRequest("INVALID_REQUEST", error.getMessage()));
	}

	@ExceptionHandler(ActivityLogServiceException.class)
	public ResponseEntity<ApiErrorResponse> handleServiceError(ActivityLogServiceException error) {
		return ResponseEntity.status(error.status()).body(ApiErrorResponses.ofCurrentRequest(error.code(), error.getMessage()));
	}
}
