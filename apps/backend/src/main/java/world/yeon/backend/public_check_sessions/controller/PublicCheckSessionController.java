package world.yeon.backend.public_check_sessions.controller;

import java.util.NoSuchElementException;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.public_check_sessions.dto.CreatePublicCheckSessionRequest;
import world.yeon.backend.public_check_sessions.dto.CreatePublicCheckSessionResponse;
import world.yeon.backend.public_check_sessions.dto.UpdatePublicCheckSessionRequest;
import world.yeon.backend.public_check_sessions.dto.UpdatePublicCheckSessionResponse;
import world.yeon.backend.public_check_sessions.service.PublicCheckSessionService;
import world.yeon.backend.public_check_sessions.service.PublicCheckSessionServiceException;
import world.yeon.backend.common.error.ApiErrorResponse;
import world.yeon.backend.common.error.ApiErrorResponses;

@Validated
@RestController
public class PublicCheckSessionController {
	private final PublicCheckSessionService service;

	public PublicCheckSessionController(PublicCheckSessionService service) {
		this.service = service;
	}

	@PostMapping("/spaces/{spaceId}/public-check-sessions")
	public ResponseEntity<CreatePublicCheckSessionResponse> createSession(@PathVariable String spaceId, @RequestHeader("X-Yeon-User-Id") UUID userId, @RequestBody CreatePublicCheckSessionRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.createSession(spaceId, userId, request));
	}

	@PatchMapping("/spaces/{spaceId}/public-check-sessions/{sessionId}")
	public UpdatePublicCheckSessionResponse updateSession(@PathVariable String spaceId, @PathVariable String sessionId, @RequestHeader("X-Yeon-User-Id") UUID userId, @RequestBody UpdatePublicCheckSessionRequest request) {
		return service.updateSession(spaceId, sessionId, userId, request);
	}

	@ExceptionHandler(NoSuchElementException.class)
	public ResponseEntity<ApiErrorResponse> handleNotFound(NoSuchElementException error) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiErrorResponses.ofCurrentRequest("SPACE_NOT_FOUND", error.getMessage()));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ApiErrorResponse> handleBadRequest(IllegalArgumentException error) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiErrorResponses.ofCurrentRequest("INVALID_REQUEST", error.getMessage()));
	}

	@ExceptionHandler(PublicCheckSessionServiceException.class)
	public ResponseEntity<ApiErrorResponse> handleServiceError(PublicCheckSessionServiceException error) {
		return ResponseEntity.status(error.status()).body(ApiErrorResponses.ofCurrentRequest(error.code(), error.getMessage()));
	}
}
