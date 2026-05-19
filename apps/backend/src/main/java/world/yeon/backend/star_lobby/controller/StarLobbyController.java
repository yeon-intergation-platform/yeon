package world.yeon.backend.star_lobby.controller;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import world.yeon.backend.star_lobby.dto.StarLobbyDtos.*;
import world.yeon.backend.star_lobby.service.StarLobbyService;
import world.yeon.backend.star_lobby.service.StarLobbyServiceException;

@RestController
@RequestMapping("/api/v1/star-lobby")
public class StarLobbyController {
	private final StarLobbyService service;

	public StarLobbyController(StarLobbyService service) {
		this.service = service;
	}

	@GetMapping("/rooms")
	public RoomListResponse listRooms() {
		return service.listRecentRooms();
	}

	@PostMapping("/observations")
	public ResponseEntity<ObservationIngestResponse> ingestObservation(@RequestBody IngestObservationRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.ingestObservation(request));
	}

	@GetMapping("/alert-rules")
	public AlertRuleListResponse listAlertRules(
		@RequestHeader(value = "X-Yeon-User-Id", required = false) UUID ownerUserId,
		@RequestHeader(value = "X-Yeon-Guest-Session-Id", required = false) String guestSessionId
	) {
		return service.listAlertRules(ownerUserId, guestSessionId);
	}

	@PostMapping("/alert-rules")
	public ResponseEntity<AlertRuleMutationResponse> createAlertRule(
		@RequestHeader(value = "X-Yeon-User-Id", required = false) UUID ownerUserId,
		@RequestHeader(value = "X-Yeon-Guest-Session-Id", required = false) String guestSessionId,
		@RequestBody AlertRuleRequest request
	) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.createAlertRule(ownerUserId, guestSessionId, request));
	}

	@PatchMapping("/alert-rules/{ruleId}")
	public AlertRuleMutationResponse updateAlertRule(
		@PathVariable UUID ruleId,
		@RequestHeader(value = "X-Yeon-User-Id", required = false) UUID ownerUserId,
		@RequestHeader(value = "X-Yeon-Guest-Session-Id", required = false) String guestSessionId,
		@RequestBody UpdateAlertRuleRequest request
	) {
		return service.updateAlertRule(ownerUserId, guestSessionId, ruleId, request);
	}

	@DeleteMapping("/alert-rules/{ruleId}")
	public ResponseEntity<Void> deleteAlertRule(
		@PathVariable UUID ruleId,
		@RequestHeader(value = "X-Yeon-User-Id", required = false) UUID ownerUserId,
		@RequestHeader(value = "X-Yeon-Guest-Session-Id", required = false) String guestSessionId
	) {
		service.deleteAlertRule(ownerUserId, guestSessionId, ruleId);
		return ResponseEntity.noContent().build();
	}

	@ExceptionHandler(StarLobbyServiceException.class)
	public ResponseEntity<ErrorResponse> serviceError(StarLobbyServiceException error) {
		return ResponseEntity.status(error.status()).body(new ErrorResponse(error.code(), error.getMessage()));
	}

	public record ErrorResponse(String code, String message) {}
}
