package world.yeon.backend.today.controller;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.common.error.ApiErrorResponse;
import world.yeon.backend.common.error.ApiErrorResponses;
import world.yeon.backend.today.dto.TodayDtos;
import world.yeon.backend.today.service.TodayService;
import world.yeon.backend.today.service.TodayServiceException;

@Validated
@RestController
@RequestMapping("/today")
public class TodayController {
	private static final String USER_ID_HEADER = "X-Yeon-User-Id";

	private final TodayService service;

	public TodayController(TodayService service) {
		this.service = service;
	}

	@GetMapping("/board")
	public TodayDtos.BoardResponse getBoard(
		@RequestHeader(value = USER_ID_HEADER, required = false) UUID userId,
		@RequestParam String date
	) {
		return service.getBoard(userId, date);
	}

	@GetMapping("/calendar")
	public TodayDtos.CalendarResponse getCalendar(
		@RequestHeader(value = USER_ID_HEADER, required = false) UUID userId,
		@RequestParam String month
	) {
		return service.getCalendar(userId, month);
	}

	@PostMapping("/tasks")
	public ResponseEntity<TodayDtos.TaskResponse> createTask(
		@RequestHeader(value = USER_ID_HEADER, required = false) UUID userId,
		@RequestBody(required = false) TodayDtos.CreateTaskRequest request
	) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.createTask(userId, request));
	}

	@PatchMapping("/tasks/{taskId}")
	public TodayDtos.TaskResponse updateTask(
		@RequestHeader(value = USER_ID_HEADER, required = false) UUID userId,
		@PathVariable UUID taskId,
		@RequestBody(required = false) TodayDtos.UpdateTaskRequest request
	) {
		return service.updateTask(userId, taskId, request);
	}

	@PostMapping("/tasks/{taskId}/complete")
	public TodayDtos.TaskResponse completeTask(
		@RequestHeader(value = USER_ID_HEADER, required = false) UUID userId,
		@PathVariable UUID taskId,
		@RequestBody(required = false) TodayDtos.TransitionTaskRequest request
	) {
		return service.completeTask(userId, taskId, request);
	}

	@PostMapping("/tasks/{taskId}/reopen")
	public TodayDtos.TaskResponse reopenTask(
		@RequestHeader(value = USER_ID_HEADER, required = false) UUID userId,
		@PathVariable UUID taskId,
		@RequestBody(required = false) TodayDtos.TransitionTaskRequest request
	) {
		return service.reopenTask(userId, taskId, request);
	}

	@DeleteMapping("/tasks/{taskId}")
	public ResponseEntity<Void> deleteTask(
		@RequestHeader(value = USER_ID_HEADER, required = false) UUID userId,
		@PathVariable UUID taskId,
		@RequestParam Long version
	) {
		service.deleteTask(userId, taskId, version);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/activity-types")
	public TodayDtos.ActivityTypesResponse listActivityTypes(
		@RequestHeader(value = USER_ID_HEADER, required = false) UUID userId
	) {
		return service.listActivityTypes(userId);
	}

	@PostMapping("/activity-types")
	public ResponseEntity<TodayDtos.ActivityTypeResponse> createActivityType(
		@RequestHeader(value = USER_ID_HEADER, required = false) UUID userId,
		@RequestBody(required = false) TodayDtos.CreateActivityTypeRequest request
	) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.createActivityType(userId, request));
	}

	@PatchMapping("/activity-types/{activityTypeId}")
	public TodayDtos.ActivityTypeResponse updateActivityType(
		@RequestHeader(value = USER_ID_HEADER, required = false) UUID userId,
		@PathVariable UUID activityTypeId,
		@RequestBody(required = false) TodayDtos.UpdateActivityTypeRequest request
	) {
		return service.updateActivityType(userId, activityTypeId, request);
	}

	@GetMapping("/records/{date}")
	public TodayDtos.RecordResponse getRecord(
		@RequestHeader(value = USER_ID_HEADER, required = false) UUID userId,
		@PathVariable String date
	) {
		return service.getRecord(userId, date);
	}

	@PutMapping("/records/{date}/slots/{hour}")
	public TodayDtos.RecordResponse upsertRecordSlot(
		@RequestHeader(value = USER_ID_HEADER, required = false) UUID userId,
		@PathVariable String date,
		@PathVariable int hour,
		@RequestBody(required = false) TodayDtos.UpsertRecordSlotRequest request
	) {
		return service.upsertRecordSlot(userId, date, hour, request);
	}

	@DeleteMapping("/records/{date}/slots/{hour}")
	public TodayDtos.RecordResponse deleteRecordSlot(
		@RequestHeader(value = USER_ID_HEADER, required = false) UUID userId,
		@PathVariable String date,
		@PathVariable int hour
	) {
		return service.deleteRecordSlot(userId, date, hour);
	}

	@ExceptionHandler(TodayServiceException.class)
	public ResponseEntity<ApiErrorResponse> handleServiceError(TodayServiceException error) {
		return ResponseEntity.status(error.status()).body(
			ApiErrorResponses.ofCurrentRequest(error.code(), error.getMessage())
		);
	}
}
