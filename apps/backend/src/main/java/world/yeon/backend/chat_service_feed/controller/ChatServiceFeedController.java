package world.yeon.backend.chat_service_feed.controller;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.chat_service_feed.dto.ChatServiceFeedListResponse;
import world.yeon.backend.chat_service_feed.dto.ChatServiceFeedMutationResponse;
import world.yeon.backend.chat_service_feed.dto.ChatServiceFeedRepliesResponse;
import world.yeon.backend.chat_service_feed.service.ChatServiceFeedService;
import world.yeon.backend.chat_service_feed.service.ChatServiceFeedServiceException;

@RestController
public class ChatServiceFeedController {
	private final ChatServiceFeedService service;

	public ChatServiceFeedController(ChatServiceFeedService service) {
		this.service = service;
	}

	@GetMapping("/chat-service/feed")
	public ChatServiceFeedListResponse list(@RequestHeader("X-Yeon-Chat-Profile-Id") UUID currentProfileId) {
		return service.list(currentProfileId);
	}

	@PostMapping("/chat-service/feed")
	@ResponseStatus(HttpStatus.CREATED)
	public ChatServiceFeedMutationResponse create(
		@RequestHeader("X-Yeon-Chat-Profile-Id") UUID currentProfileId,
		@RequestBody CreateFeedPostRequest request
	) {
		return service.create(currentProfileId, request.body(), null);
	}

	@GetMapping("/chat-service/feed/{postId}/replies")
	public ChatServiceFeedRepliesResponse listReplies(
		@RequestHeader("X-Yeon-Chat-Profile-Id") UUID currentProfileId,
		@PathVariable UUID postId
	) {
		return service.listReplies(currentProfileId, postId);
	}

	@PostMapping("/chat-service/feed/{postId}/replies")
	@ResponseStatus(HttpStatus.CREATED)
	public ChatServiceFeedMutationResponse createReply(
		@RequestHeader("X-Yeon-Chat-Profile-Id") UUID currentProfileId,
		@PathVariable UUID postId,
		@RequestBody CreateFeedPostRequest request
	) {
		return service.create(currentProfileId, request.body(), postId);
	}

	@ExceptionHandler(ChatServiceFeedServiceException.class)
	public ResponseEntity<ErrorResponse> handleServiceError(ChatServiceFeedServiceException error) {
		return ResponseEntity.status(error.status()).body(new ErrorResponse(error.code(), error.getMessage()));
	}

	public record CreateFeedPostRequest(String body) {}
	public record ErrorResponse(String code, String message) {}
}
