package world.yeon.backend.chat_service_friend_requests.controller;

import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.chat_service_friend_requests.dto.ChatServiceFriendMutationResponse;
import world.yeon.backend.chat_service_friend_requests.service.ChatServiceFriendRequestService;
import world.yeon.backend.chat_service_friend_requests.service.ChatServiceFriendRequestServiceException;

@RestController
public class ChatServiceFriendRequestController {
	private final ChatServiceFriendRequestService service;

	public ChatServiceFriendRequestController(ChatServiceFriendRequestService service) {
		this.service = service;
	}

	@PostMapping("/chat-service/friends/requests")
	public ChatServiceFriendMutationResponse send(
		@RequestHeader("X-Yeon-Chat-Profile-Id") UUID currentProfileId,
		@RequestBody SendFriendRequest request
	) {
		return service.send(currentProfileId, request.targetProfileId());
	}

	@ExceptionHandler(ChatServiceFriendRequestServiceException.class)
	public ResponseEntity<ErrorResponse> handleServiceError(ChatServiceFriendRequestServiceException error) {
		return ResponseEntity.status(error.status()).body(new ErrorResponse(error.code(), error.getMessage()));
	}

	public record SendFriendRequest(UUID targetProfileId) {}
	public record ErrorResponse(String code, String message) {}
}
