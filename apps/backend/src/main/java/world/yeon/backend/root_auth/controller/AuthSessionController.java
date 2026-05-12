package world.yeon.backend.root_auth.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.root_auth.dto.AuthSessionResponse;
import world.yeon.backend.root_auth.service.AuthSessionService;
import world.yeon.backend.root_auth.service.AuthSessionServiceException;

@Validated
@RestController
public class AuthSessionController {
	private static final String SESSION_TOKEN_HEADER = "X-Yeon-Session-Token";
	private final AuthSessionService service;

	public AuthSessionController(AuthSessionService service) {
		this.service = service;
	}

	@GetMapping("/auth/session")
	public AuthSessionResponse getSession(@RequestHeader(name = SESSION_TOKEN_HEADER, required = false) String sessionToken) {
		return service.getSession(sessionToken);
	}

	@DeleteMapping("/auth/session")
	public AuthSessionResponse deleteSession(@RequestHeader(name = SESSION_TOKEN_HEADER, required = false) String sessionToken) {
		return service.deleteSession(sessionToken);
	}

	@ExceptionHandler(AuthSessionServiceException.class)
	public ResponseEntity<ErrorResponse> handleServiceError(AuthSessionServiceException error) {
		return ResponseEntity.status(error.status()).body(new ErrorResponse(error.code(), error.getMessage()));
	}

	@ExceptionHandler(IllegalStateException.class)
	public ResponseEntity<ErrorResponse> handleIllegalState(IllegalStateException error) {
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse("AUTH_SESSION_STATE_ERROR", "인증 세션 상태를 해석하지 못했습니다."));
	}

	public record ErrorResponse(String code, String message) {}
}
