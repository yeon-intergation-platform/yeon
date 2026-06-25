package world.yeon.backend.game_service_library.controller;

import java.util.UUID;
import org.springframework.web.bind.annotation.*;
import world.yeon.backend.game_service_library.dto.FavoriteToggleResponse;
import world.yeon.backend.game_service_library.dto.SlugListResponse;
import world.yeon.backend.game_service_library.service.GameServiceLibraryService;

// 내 게임(찜·최근 플레이). 사용자 정체성은 웹 BFF가 헤더(X-Yeon-User-Id)로 주입한다.
@RestController
public class GameServiceLibraryController {
	private static final String USER_ID_HEADER = "X-Yeon-User-Id";

	private final GameServiceLibraryService service;

	public GameServiceLibraryController(GameServiceLibraryService service) {
		this.service = service;
	}

	@GetMapping("/game-service/library/favorites")
	public SlugListResponse favorites(
		@RequestHeader(value = USER_ID_HEADER, required = false) UUID userId
	) {
		return new SlugListResponse(service.listFavorites(userId));
	}

	@PostMapping("/game-service/library/favorites")
	public FavoriteToggleResponse toggleFavorite(
		@RequestBody SlugRequest request,
		@RequestHeader(value = USER_ID_HEADER, required = false) UUID userId
	) {
		return new FavoriteToggleResponse(service.toggleFavorite(userId, request.gameSlug()));
	}

	@GetMapping("/game-service/library/recent")
	public SlugListResponse recent(
		@RequestHeader(value = USER_ID_HEADER, required = false) UUID userId
	) {
		return new SlugListResponse(service.listRecent(userId));
	}

	@PostMapping("/game-service/library/recent")
	public void recordPlay(
		@RequestBody SlugRequest request,
		@RequestHeader(value = USER_ID_HEADER, required = false) UUID userId
	) {
		service.recordPlay(userId, request.gameSlug());
	}

	public record SlugRequest(String gameSlug) {}
}
