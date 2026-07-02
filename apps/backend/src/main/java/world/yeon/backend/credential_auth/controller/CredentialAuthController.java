package world.yeon.backend.credential_auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.credential_auth.dto.*;
import world.yeon.backend.credential_auth.service.CredentialAuthService;
import world.yeon.backend.credential_auth.service.CredentialAuthServiceException;
import world.yeon.backend.common.error.ApiErrorResponse;
import world.yeon.backend.common.error.ApiErrorResponses;

@Validated
@RestController
public class CredentialAuthController {
	private static final String SESSION_TOKEN_HEADER = "X-Yeon-Session-Token";
	private final CredentialAuthService service;

	public CredentialAuthController(CredentialAuthService service) {
		this.service = service;
	}

	@PostMapping("/auth/credentials/login")
	public CredentialLoginResponse login(@RequestBody CredentialLoginRequest request) {
		return service.login(request);
	}

	@PostMapping("/auth/credentials/register")
	public CredentialRegisterResponse register(@RequestBody CredentialRegisterRequest request) {
		return service.register(request);
	}

	@PostMapping("/auth/credentials/resend-verification")
	public ResponseEntity<Void> resendVerification(@RequestBody CredentialEmailRequest request) {
		service.resendVerification(request);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/auth/credentials/verify")
	public ResponseEntity<Void> verify(@RequestParam("token") String token) {
		service.verifyEmail(new CredentialVerifyEmailRequest(token));
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/auth/credentials/reset-request")
	public ResponseEntity<Void> requestPasswordReset(@RequestBody CredentialEmailRequest request) {
		service.requestPasswordReset(request);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/auth/credentials/reset-confirm")
	public ResponseEntity<Void> confirmPasswordReset(@RequestBody CredentialResetConfirmRequest request) {
		service.confirmPasswordReset(request);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/auth/credentials/set-password")
	public ResponseEntity<Void> setPassword(
		@RequestHeader(name = SESSION_TOKEN_HEADER, required = false) String sessionToken,
		@RequestBody CredentialSetPasswordRequest request
	) {
		service.setPassword(sessionToken, request);
		return ResponseEntity.noContent().build();
	}

	@ExceptionHandler(CredentialAuthServiceException.class)
	public ResponseEntity<ApiErrorResponse> handleServiceError(CredentialAuthServiceException error) {
		return ResponseEntity.status(error.status()).body(ApiErrorResponses.ofCurrentRequest(error.code(), error.getMessage()));
	}
}
