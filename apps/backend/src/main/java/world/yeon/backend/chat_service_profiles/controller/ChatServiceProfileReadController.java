package world.yeon.backend.chat_service_profiles.controller;

import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.chat_service_profiles.dto.ChatServiceGetProfileResponse;
import world.yeon.backend.chat_service_profiles.service.ChatServiceProfileReadService;
import world.yeon.backend.chat_service_profiles.service.ChatServiceProfileReadServiceException;

@RestController
@Profile("jdbc")
public class ChatServiceProfileReadController {
	private final ChatServiceProfileReadService service;

	public ChatServiceProfileReadController(ChatServiceProfileReadService service) {
		this.service = service;
	}

	@GetMapping("/chat-service/profiles/{profileId}")
	public ChatServiceGetProfileResponse getProfile(
		@RequestHeader("X-Yeon-Chat-Profile-Id") UUID currentProfileId,
		@PathVariable UUID profileId
	) {
		return service.getProfile(currentProfileId, profileId);
	}

	@ExceptionHandler(ChatServiceProfileReadServiceException.class)
	public ResponseEntity<ErrorResponse> handleServiceError(ChatServiceProfileReadServiceException error) {
		return ResponseEntity.status(error.status()).body(new ErrorResponse(error.code(), error.getMessage()));
	}

	public record ErrorResponse(String code, String message) {}
}
