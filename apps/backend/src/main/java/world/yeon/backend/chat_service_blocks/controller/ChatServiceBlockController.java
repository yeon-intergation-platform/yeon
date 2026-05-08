package world.yeon.backend.chat_service_blocks.controller;

import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.chat_service_blocks.dto.ChatServiceBlockProfilesResponse;
import world.yeon.backend.chat_service_blocks.service.ChatServiceBlockService;
import world.yeon.backend.chat_service_blocks.service.ChatServiceBlockServiceException;

@RestController
@Profile("jdbc")
public class ChatServiceBlockController {
	private final ChatServiceBlockService service;

	public ChatServiceBlockController(ChatServiceBlockService service) {
		this.service = service;
	}

	@PostMapping("/chat-service/profiles/{profileId}/block")
	public ChatServiceBlockProfilesResponse block(
		@RequestHeader("X-Yeon-Chat-Profile-Id") UUID currentProfileId,
		@PathVariable UUID profileId
	) {
		return service.block(currentProfileId, profileId);
	}

	@DeleteMapping("/chat-service/profiles/{profileId}/block")
	public ChatServiceBlockProfilesResponse unblock(
		@RequestHeader("X-Yeon-Chat-Profile-Id") UUID currentProfileId,
		@PathVariable UUID profileId
	) {
		return service.unblock(currentProfileId, profileId);
	}

	@ExceptionHandler(ChatServiceBlockServiceException.class)
	public ResponseEntity<ErrorResponse> handleServiceError(ChatServiceBlockServiceException error) {
		return ResponseEntity.status(error.status()).body(new ErrorResponse(error.code(), error.getMessage()));
	}

	public record ErrorResponse(String code, String message) {}
}
