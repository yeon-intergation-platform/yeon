package world.yeon.backend.root_auth.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.root_auth.dto.*;
import world.yeon.backend.root_auth.service.AuthSessionService;
import world.yeon.backend.root_auth.service.AuthSessionServiceException;
import world.yeon.backend.common.error.ApiErrorResponse;
import world.yeon.backend.common.error.ApiErrorResponses;

@Validated
@RestController
public class AuthSessionController {
	private static final Logger log = LoggerFactory.getLogger(AuthSessionController.class);
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

	@PostMapping("/auth/session")
	public RootAuthSessionCreateResponse createSession(@RequestBody RootAuthSessionCreateRequest request) {
		return service.createSessionForUser(request == null ? null : request.userId());
	}

	@PostMapping("/auth/social/complete")
	public RootAuthSessionCreateResponse completeSocialAuth(@RequestBody SocialAuthCompleteRequest request) {
		return service.completeSocialAuth(request);
	}

	@GetMapping("/auth/dev-login/options")
	public DevLoginOptionsResponse listDevLoginOptions() {
		return service.listDevLoginOptions();
	}

	@PostMapping("/auth/dev-login/session")
	public RootAuthSessionCreateResponse createDevLoginSession(@RequestBody DevLoginSessionRequest request) {
		return service.createDevLoginSession(request);
	}

	@PostMapping("/auth/admin/check")
	public AdminCheckResponse checkAdmin(@RequestBody AdminCheckRequest request) {
		return service.checkAdmin(request);
	}

	@ExceptionHandler(AuthSessionServiceException.class)
	public ResponseEntity<ApiErrorResponse> handleServiceError(AuthSessionServiceException error) {
		return ResponseEntity.status(error.status()).body(ApiErrorResponses.ofCurrentRequest(error.code(), error.getMessage()));
	}

	@ExceptionHandler(IllegalStateException.class)
	public ResponseEntity<ApiErrorResponse> handleIllegalState(IllegalStateException error) {
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiErrorResponses.ofCurrentRequest("AUTH_SESSION_STATE_ERROR", "인증 세션 상태를 해석하지 못했습니다."));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ApiErrorResponse> handleBadRequest(IllegalArgumentException error) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiErrorResponses.ofCurrentRequest("AUTH_INVALID_REQUEST", "인증 요청이 올바르지 않습니다."));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiErrorResponse> handleUnexpected(Exception error) {
		log.error("인증 세션 처리 중 예기치 못한 오류", error);
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiErrorResponses.ofCurrentRequest("AUTH_SESSION_ERROR", "인증 처리 중 오류가 발생했습니다."));
	}
}
