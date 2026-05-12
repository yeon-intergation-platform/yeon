package world.yeon.backend.credential_auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.credential_auth.dto.CredentialLoginRequest;
import world.yeon.backend.credential_auth.dto.CredentialLoginResponse;
import world.yeon.backend.credential_auth.service.CredentialAuthService;
import world.yeon.backend.credential_auth.service.CredentialAuthServiceException;

@Validated
@RestController
public class CredentialAuthController {
	private final CredentialAuthService service;

	public CredentialAuthController(CredentialAuthService service) {
		this.service = service;
	}

	@PostMapping("/auth/credentials/login")
	public CredentialLoginResponse login(@RequestBody CredentialLoginRequest request) {
		return service.login(request);
	}

	@ExceptionHandler(CredentialAuthServiceException.class)
	public ResponseEntity<ErrorResponse> handleServiceError(CredentialAuthServiceException error) {
		return ResponseEntity.status(error.status()).body(new ErrorResponse(error.code(), error.getMessage()));
	}

	public record ErrorResponse(String code, String message) {}
}
