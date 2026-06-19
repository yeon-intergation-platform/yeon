package world.yeon.backend.chat_service_profiles.controller;

import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.chat_service_profiles.dto.ChatServiceGetProfileResponse;
import world.yeon.backend.chat_service_profiles.service.ChatServiceProfileReadService;

@RestController
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

}
