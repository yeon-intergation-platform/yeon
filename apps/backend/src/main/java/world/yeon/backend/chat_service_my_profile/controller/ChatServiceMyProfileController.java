package world.yeon.backend.chat_service_my_profile.controller;

import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import world.yeon.backend.chat_service_my_profile.dto.*;
import world.yeon.backend.chat_service_my_profile.service.ChatServiceMyProfileService;
import world.yeon.backend.chat_service_my_profile.service.ChatServiceMyProfileServiceException;

@RestController
public class ChatServiceMyProfileController {
	private final ChatServiceMyProfileService service;

	public ChatServiceMyProfileController(ChatServiceMyProfileService service) {
		this.service = service;
	}

	@GetMapping("/chat-service/profile/me")
	public ChatServiceGetMyProfileResponse get(@RequestHeader("X-Yeon-Chat-Profile-Id") UUID currentProfileId) {
		return service.get(currentProfileId);
	}

	@PatchMapping("/chat-service/profile/me")
	public ChatServiceUpdateMyProfileResponse update(@RequestHeader("X-Yeon-Chat-Profile-Id") UUID currentProfileId, @RequestBody UpdateRequest request) {
		return service.update(currentProfileId, request.nickname(), request.ageLabel(), request.regionLabel(), request.bio(), request.notificationsEnabled());
	}

	@DeleteMapping("/chat-service/profile/me")
	public ChatServiceDeleteMyProfileResponse delete(@RequestHeader("X-Yeon-Chat-Profile-Id") UUID currentProfileId) {
		return service.delete(currentProfileId);
	}

	@ExceptionHandler(ChatServiceMyProfileServiceException.class)
	public ResponseEntity<ErrorResponse> handleServiceError(ChatServiceMyProfileServiceException error) {
		return ResponseEntity.status(error.status()).body(new ErrorResponse(error.code(), error.getMessage()));
	}

	public record UpdateRequest(String nickname, String ageLabel, String regionLabel, String bio, boolean notificationsEnabled) {}
	public record ErrorResponse(String code, String message) {}
}
