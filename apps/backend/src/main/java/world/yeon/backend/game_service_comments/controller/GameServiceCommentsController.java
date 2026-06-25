package world.yeon.backend.game_service_comments.controller;

import java.util.UUID;
import org.springframework.web.bind.annotation.*;
import world.yeon.backend.game_service_comments.dto.DeleteGameCommentResponse;
import world.yeon.backend.game_service_comments.dto.GameCommentDto;
import world.yeon.backend.game_service_comments.dto.GameCommentListResponse;
import world.yeon.backend.game_service_comments.dto.RevealGameCommentResponse;
import world.yeon.backend.game_service_comments.service.GameServiceCommentsService;

// 사용자 정체성은 웹 BFF가 헤더로 주입한다(세션 위조 차단). 게스트는 헤더 없이 body로만 식별.
@RestController
public class GameServiceCommentsController {
	private static final String USER_ID_HEADER = "X-Yeon-User-Id";
	private static final String USER_NAME_HEADER = "X-Yeon-User-Name";
	private static final String USER_AVATAR_HEADER = "X-Yeon-User-Avatar";
	private static final String USER_ROLE_HEADER = "X-Yeon-User-Role";

	private final GameServiceCommentsService service;

	public GameServiceCommentsController(GameServiceCommentsService service) {
		this.service = service;
	}

	@GetMapping("/game-service/comments")
	public GameCommentListResponse list(
		@RequestParam("gameSlug") String gameSlug,
		@RequestHeader(value = USER_ID_HEADER, required = false) UUID viewerUserId,
		@RequestHeader(value = USER_ROLE_HEADER, required = false) String viewerRole
	) {
		return new GameCommentListResponse(service.list(gameSlug, viewerUserId, isAdmin(viewerRole)));
	}

	@PostMapping("/game-service/comments")
	public GameCommentDto create(
		@RequestBody CreateRequest request,
		@RequestHeader(value = USER_ID_HEADER, required = false) UUID viewerUserId,
		@RequestHeader(value = USER_NAME_HEADER, required = false) String viewerName,
		@RequestHeader(value = USER_AVATAR_HEADER, required = false) String viewerAvatar
	) {
		return service.create(
			request.gameSlug(),
			request.content(),
			request.isSecret(),
			viewerUserId,
			viewerName,
			viewerAvatar,
			request.guestNickname(),
			request.guestPassword()
		);
	}

	@PostMapping("/game-service/comments/{id}/reveal")
	public RevealGameCommentResponse reveal(@PathVariable UUID id, @RequestBody RevealRequest request) {
		return new RevealGameCommentResponse(service.reveal(id, request.password()));
	}

	@DeleteMapping("/game-service/comments/{id}")
	public DeleteGameCommentResponse delete(
		@PathVariable UUID id,
		@RequestParam(value = "password", required = false) String password,
		@RequestHeader(value = USER_ID_HEADER, required = false) UUID viewerUserId,
		@RequestHeader(value = USER_ROLE_HEADER, required = false) String viewerRole
	) {
		return new DeleteGameCommentResponse(service.delete(id, viewerUserId, isAdmin(viewerRole), password));
	}

	private static boolean isAdmin(String role) {
		return role != null && role.trim().equalsIgnoreCase("admin");
	}

	public record CreateRequest(
		String gameSlug,
		String content,
		boolean isSecret,
		String guestNickname,
		String guestPassword
	) {}

	public record RevealRequest(String password) {}
}
