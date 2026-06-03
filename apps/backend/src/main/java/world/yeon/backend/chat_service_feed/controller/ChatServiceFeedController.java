package world.yeon.backend.chat_service_feed.controller;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.chat_service_feed.dto.ChatServiceFeedDeleteResponse;
import world.yeon.backend.chat_service_feed.dto.ChatServiceFeedListResponse;
import world.yeon.backend.chat_service_feed.dto.ChatServiceFeedMutationResponse;
import world.yeon.backend.chat_service_feed.dto.ChatServiceFeedRepliesResponse;
import world.yeon.backend.chat_service_feed.service.ChatServiceFeedService;
import world.yeon.backend.chat_service_feed.service.ChatServiceFeedServiceException;

// IDX 48 신뢰 경계: X-Yeon-Chat-Profile-Id 는 소유권/권한 판단의 근거로 쓰이지만 백엔드가 세션과 직접 대조하지 않는다.
// 이 신뢰는 SecurityConfig 의 불변식(community-chat 외 모든 요청은 InternalServiceTokenAuthFilter 로 인증된 BFF 만 도달)에 의존한다.
// 즉 BFF 가 chat_service_auth 세션 검증 후에만 이 헤더를 채운다는 전제가 깨지면 사칭이 가능하므로,
// 이 헤더를 채우는 책임은 내부 토큰을 가진 BFF 에만 있어야 한다(헤더를 외부에서 직접 신뢰하지 않는다).
@RestController
public class ChatServiceFeedController {
	private final ChatServiceFeedService service;

	public ChatServiceFeedController(ChatServiceFeedService service) {
		this.service = service;
	}

	@GetMapping("/chat-service/feed")
	public ChatServiceFeedListResponse list(
		@RequestHeader(value = "X-Yeon-Chat-Profile-Id", required = false) UUID currentProfileId
	) {
		return service.list(currentProfileId);
	}

	@GetMapping("/chat-service/feed/{postId}")
	public ChatServiceFeedMutationResponse get(
		@RequestHeader(value = "X-Yeon-Chat-Profile-Id", required = false) UUID currentProfileId,
		@PathVariable UUID postId
	) {
		return service.get(currentProfileId, postId);
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
		@RequestHeader(value = "X-Yeon-Chat-Profile-Id", required = false) UUID currentProfileId,
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

	@PatchMapping("/chat-service/feed/{postId}")
	public ChatServiceFeedMutationResponse update(
		@RequestHeader("X-Yeon-Chat-Profile-Id") UUID currentProfileId,
		@PathVariable UUID postId,
		@RequestBody CreateFeedPostRequest request
	) {
		return service.update(currentProfileId, postId, request.body());
	}

	@DeleteMapping("/chat-service/feed/{postId}")
	public ChatServiceFeedDeleteResponse delete(
		@RequestHeader("X-Yeon-Chat-Profile-Id") UUID currentProfileId,
		@PathVariable UUID postId
	) {
		return service.delete(currentProfileId, postId);
	}

	@ExceptionHandler(ChatServiceFeedServiceException.class)
	public ResponseEntity<ErrorResponse> handleServiceError(ChatServiceFeedServiceException error) {
		return ResponseEntity.status(error.status()).body(new ErrorResponse(error.code(), error.getMessage()));
	}

	public record CreateFeedPostRequest(String body) {}
	public record ErrorResponse(String code, String message) {}
}
