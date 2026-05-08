package world.yeon.backend.public_check_runtime.controller;

import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import world.yeon.backend.public_check_runtime.dto.*;
import world.yeon.backend.public_check_runtime.service.PublicCheckRuntimeService;
import world.yeon.backend.public_check_runtime.service.PublicCheckRuntimeServiceException;

@Validated
@RestController
@Profile("jdbc")
public class PublicCheckRuntimeController {
	private final PublicCheckRuntimeService service;

	public PublicCheckRuntimeController(PublicCheckRuntimeService service) {
		this.service = service;
	}

	@GetMapping("/public-check-sessions/{token}")
	public GetPublicCheckSessionResponse getSession(@PathVariable String token, @RequestParam(required = false) String entry, @RequestParam(required = false) List<String> remembered) {
		return service.getSession(token, entry, remembered == null ? List.of() : remembered);
	}

	@PostMapping("/public-check-sessions/{token}/verify")
	public VerifyPublicCheckIdentityResponse verify(@PathVariable String token, @RequestBody VerifyPublicCheckIdentityRequest request) {
		return service.verifyIdentity(token, request);
	}

	@PostMapping("/public-check-sessions/{token}/submit")
	public SubmitPublicCheckResponse submit(@PathVariable String token, @RequestBody SubmitPublicCheckRequest request) {
		return service.submit(token, request);
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ErrorResponse> handleBadRequest(IllegalArgumentException error) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("INVALID_REQUEST", error.getMessage()));
	}

	@ExceptionHandler(PublicCheckRuntimeServiceException.class)
	public ResponseEntity<ErrorResponse> handleServiceError(PublicCheckRuntimeServiceException error) {
		return ResponseEntity.status(error.status()).body(new ErrorResponse(error.code(), error.getMessage()));
	}

	public record ErrorResponse(String code, String message) {}
}
