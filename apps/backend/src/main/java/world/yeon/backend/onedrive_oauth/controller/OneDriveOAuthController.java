package world.yeon.backend.onedrive_oauth.controller;

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
import world.yeon.backend.onedrive_oauth.dto.OneDriveOAuthCallbackRequest;
import world.yeon.backend.onedrive_oauth.dto.OneDriveOAuthUrlResponse;
import world.yeon.backend.onedrive_oauth.service.OneDriveOAuthService;
import world.yeon.backend.onedrive_oauth.service.OneDriveOAuthServiceException;

@Validated
@RestController
public class OneDriveOAuthController {
	private final OneDriveOAuthService service;
	public OneDriveOAuthController(OneDriveOAuthService service) { this.service = service; }

	@GetMapping("/onedrive/oauth-url")
	public OneDriveOAuthUrlResponse getOAuthUrl(@RequestParam String state) { return service.buildOAuthUrl(state); }

	@PostMapping("/onedrive/oauth-callback")
	public ResponseEntity<Void> callback(@RequestHeader("X-Yeon-User-Id") UUID userId, @Valid @RequestBody OneDriveOAuthCallbackRequest request) {
		service.exchangeAndSave(userId, request.code());
		return ResponseEntity.ok().build();
	}

	@ExceptionHandler(OneDriveOAuthServiceException.class)
	public ResponseEntity<ErrorResponse> handleServiceError(OneDriveOAuthServiceException error) {
		return ResponseEntity.status(error.status()).contentType(MediaType.APPLICATION_JSON).body(new ErrorResponse(error.code(), error.getMessage()));
	}
	public record ErrorResponse(String code, String message) {}
}
