package world.yeon.backend.community_chat.controller;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import world.yeon.backend.community_chat.dto.*;
import world.yeon.backend.community_chat.service.CommunityChatService;
import world.yeon.backend.community_chat.service.CommunityChatServiceException;

@RestController
@RequestMapping("/api/v1/community-chat/messages")
public class CommunityChatController {
	private final CommunityChatService service;

	public CommunityChatController(CommunityChatService service) {
		this.service = service;
	}

	@GetMapping
	public CommunityChatMessagesResponse listMessages() {
		return service.listMessages();
	}

	@PostMapping
	public ResponseEntity<CommunityChatMessageMutationResponse> sendMessage(
		@RequestHeader(value = "X-Yeon-User-Id", required = false) UUID senderUserId,
		@RequestBody SendCommunityChatMessageRequest request
	) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.send(senderUserId, request));
	}

	@ExceptionHandler(CommunityChatServiceException.class)
	public ResponseEntity<ErrorResponse> serviceError(CommunityChatServiceException error) {
		return ResponseEntity.status(error.status()).body(new ErrorResponse(error.code(), error.getMessage()));
	}

	public record ErrorResponse(String code, String message) {}
}
