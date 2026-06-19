package world.yeon.backend.chat_service_chat_open.controller;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.chat_service_chat_open.dto.ChatServiceOpenChatResponse;
import world.yeon.backend.chat_service_chat_open.service.ChatServiceChatOpenService;

@RestController
public class ChatServiceChatOpenController {
	private final ChatServiceChatOpenService service;

	public ChatServiceChatOpenController(ChatServiceChatOpenService service) {
		this.service = service;
	}

	@PostMapping("/chat-service/chat/open")
	@ResponseStatus(HttpStatus.CREATED)
	public ChatServiceOpenChatResponse open(
		@RequestHeader("X-Yeon-Chat-Profile-Id") UUID currentProfileId,
		@RequestBody OpenChatRequest request
	) {
		return service.open(currentProfileId, request.targetProfileId());
	}

	public record OpenChatRequest(UUID targetProfileId) {}
}
