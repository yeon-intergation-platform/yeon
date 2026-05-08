package world.yeon.backend.life_os.controller;

import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import world.yeon.backend.life_os.dto.*;
import world.yeon.backend.life_os.service.LifeOsService;
import world.yeon.backend.life_os.service.LifeOsServiceException;

@Validated
@RestController
@Profile("jdbc")
public class LifeOsController {
	private final LifeOsService service;

	public LifeOsController(LifeOsService service) {
		this.service = service;
	}

	@GetMapping("/life-os/days")
	public GetLifeOsDaysResponse listDays(@RequestHeader("X-Yeon-User-Id") UUID userId) {
		return service.listDays(userId);
	}

	@PostMapping("/life-os/days")
	public ResponseEntity<GetLifeOsDayResponse> createDay(@RequestHeader("X-Yeon-User-Id") UUID userId, @RequestBody UpsertLifeOsDayRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.upsertDay(userId, request));
	}

	@GetMapping("/life-os/days/{date}")
	public GetLifeOsDayResponse getDay(@RequestHeader("X-Yeon-User-Id") UUID userId, @PathVariable String date) {
		return service.getDay(userId, date);
	}

	@PutMapping("/life-os/days/{date}")
	public GetLifeOsDayResponse updateDay(@RequestHeader("X-Yeon-User-Id") UUID userId, @PathVariable String date, @RequestBody UpsertLifeOsDayRequest request) {
		return service.upsertDay(userId, new UpsertLifeOsDayRequest(date, request == null ? null : request.timezone(), request == null ? null : request.mindset(), request == null ? null : request.backlogText(), request == null ? null : request.entries()));
	}

	@GetMapping("/life-os/reports/daily")
	public LifeOsReportResponse getDailyReport(@RequestHeader("X-Yeon-User-Id") UUID userId, @RequestParam String localDate) {
		return service.buildDailyReport(userId, localDate);
	}

	@GetMapping("/life-os/reports/weekly")
	public LifeOsReportResponse getWeeklyReport(@RequestHeader("X-Yeon-User-Id") UUID userId, @RequestParam String periodStart, @RequestParam String periodEnd) {
		return service.buildWeeklyReport(userId, periodStart, periodEnd);
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ErrorResponse> handleBadRequest(IllegalArgumentException error) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("INVALID_REQUEST", error.getMessage()));
	}

	@ExceptionHandler(LifeOsServiceException.class)
	public ResponseEntity<ErrorResponse> handleServiceError(LifeOsServiceException error) {
		return ResponseEntity.status(error.status()).body(new ErrorResponse(error.code(), error.getMessage()));
	}

	public record ErrorResponse(String code, String message) {}
}
