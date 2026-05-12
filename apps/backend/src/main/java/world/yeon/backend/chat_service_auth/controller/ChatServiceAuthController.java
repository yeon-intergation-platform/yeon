package world.yeon.backend.chat_service_auth.controller;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import world.yeon.backend.chat_service_auth.dto.*;
import world.yeon.backend.chat_service_auth.service.ChatServiceAuthService;
import world.yeon.backend.chat_service_auth.service.ChatServiceAuthServiceException;

@RestController
public class ChatServiceAuthController {
	private final ChatServiceAuthService service;

	public ChatServiceAuthController(ChatServiceAuthService service) {
		this.service = service;
	}

	@PostMapping("/chat-service/auth/request-otp")
	@ResponseStatus(HttpStatus.CREATED)
	public ChatServiceRequestOtpResponse requestOtp(@RequestBody RequestOtpRequest request) {
		return service.requestOtp(request.phoneNumber());
	}

	@PostMapping("/chat-service/auth/verify-otp")
	public ChatServiceVerifyOtpResponse verifyOtp(@RequestBody VerifyOtpRequest request) {
		return service.verifyOtp(request.challengeId(), request.phoneNumber(), request.code());
	}

	@GetMapping("/chat-service/auth/session")
	public ChatServiceSessionStateResponse getSession(@RequestHeader(value = "X-Yeon-Chat-Session-Token", required = false) String sessionToken) {
		return service.getSession(sessionToken);
	}

	@DeleteMapping("/chat-service/auth/session")
	public ChatServiceSessionStateResponse logout(@RequestHeader(value = "X-Yeon-Chat-Session-Token", required = false) String sessionToken) {
		return service.logout(sessionToken);
	}

	@ExceptionHandler(ChatServiceAuthServiceException.class)
	public ResponseEntity<ErrorResponse> handleServiceError(ChatServiceAuthServiceException error) {
		return ResponseEntity.status(error.status()).body(new ErrorResponse(error.code(), error.getMessage()));
	}

	public record RequestOtpRequest(String phoneNumber) {}
	public record VerifyOtpRequest(UUID challengeId, String phoneNumber, String code) {}
	public record ErrorResponse(String code, String message) {}
}
