package world.yeon.backend.googledrive_oauth.controller;

import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.googledrive_oauth.dto.GoogleDriveOAuthCallbackRequest;
import world.yeon.backend.googledrive_oauth.dto.GoogleDriveOAuthUrlResponse;
import world.yeon.backend.googledrive_oauth.service.GoogleDriveOAuthService;
import world.yeon.backend.googledrive_oauth.service.GoogleDriveOAuthServiceException;

@Validated
@RestController
public class GoogleDriveOAuthController {
	private final GoogleDriveOAuthService service;
	public GoogleDriveOAuthController(GoogleDriveOAuthService service) { this.service = service; }

	@GetMapping("/googledrive/oauth-url")
	public GoogleDriveOAuthUrlResponse getOAuthUrl(@RequestParam String state) { return service.buildOAuthUrl(state); }

	@PostMapping("/googledrive/oauth-callback")
	public ResponseEntity<Void> callback(@RequestHeader("X-Yeon-User-Id") UUID userId, @Valid @RequestBody GoogleDriveOAuthCallbackRequest request) {
		service.exchangeAndSave(userId, request.code());
		return ResponseEntity.ok().build();
	}

	@ExceptionHandler(GoogleDriveOAuthServiceException.class)
	public ResponseEntity<ErrorResponse> handleServiceError(GoogleDriveOAuthServiceException error) {
		return ResponseEntity.status(error.status()).contentType(MediaType.APPLICATION_JSON).body(new ErrorResponse(error.code(), error.getMessage()));
	}
	public record ErrorResponse(String code, String message) {}
}
