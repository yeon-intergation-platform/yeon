package world.yeon.backend.game_service_likes.controller;

import java.util.UUID;
import org.springframework.web.bind.annotation.*;
import world.yeon.backend.game_service_likes.dto.GameLikeRankingResponse;
import world.yeon.backend.game_service_likes.dto.GameLikeStatusResponse;
import world.yeon.backend.game_service_likes.service.GameServiceLikesService;

// 사용자 정체성은 웹 BFF가 헤더(X-Yeon-User-Id)로 주입한다.
@RestController
public class GameServiceLikesController {
	private static final String USER_ID_HEADER = "X-Yeon-User-Id";

	private final GameServiceLikesService service;

	public GameServiceLikesController(GameServiceLikesService service) {
		this.service = service;
	}

	@GetMapping("/game-service/likes")
	public GameLikeStatusResponse status(
		@RequestParam("gameSlug") String gameSlug,
		@RequestHeader(value = USER_ID_HEADER, required = false) UUID userId
	) {
		return service.status(gameSlug, userId);
	}

	@PostMapping("/game-service/likes")
	public GameLikeStatusResponse toggle(
		@RequestBody ToggleRequest request,
		@RequestHeader(value = USER_ID_HEADER, required = false) UUID userId
	) {
		return service.toggle(request.gameSlug(), userId);
	}

	@GetMapping("/game-service/likes/ranking")
	public GameLikeRankingResponse ranking(
		@RequestParam(value = "limit", required = false, defaultValue = "100") int limit
	) {
		return service.ranking(limit);
	}

	public record ToggleRequest(String gameSlug) {}
}
