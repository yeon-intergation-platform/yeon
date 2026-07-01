package world.yeon.backend.game_service_likes.service;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.game_service_common.service.GameServiceException;
import world.yeon.backend.game_service_likes.dto.GameLikeRankingResponse;
import world.yeon.backend.game_service_likes.dto.GameLikeStatusResponse;
import world.yeon.backend.game_service_likes.repository.GameServiceLikesRepository;

@Service
public class GameServiceLikesService {
	private static final int MAX_SLUG_LENGTH = 80;
	private static final int MAX_RANKING_LIMIT = 100;
	private static final String CODE_AUTH_REQUIRED = "GAME_LIKE_AUTH_REQUIRED";
	private static final String CODE_SLUG_INVALID = "GAME_SLUG_INVALID";

	private final GameServiceLikesRepository repository;

	public GameServiceLikesService(GameServiceLikesRepository repository) {
		this.repository = repository;
	}

	@Transactional(readOnly = true)
	public GameLikeStatusResponse status(String gameSlug, UUID userId) {
		String slug = requireSlug(gameSlug);
		long count = repository.countByGame(slug);
		boolean liked = userId != null && repository.exists(slug, userId);
		return new GameLikeStatusResponse(count, liked);
	}

	@Transactional
	public GameLikeStatusResponse toggle(String gameSlug, UUID userId) {
		if (userId == null) {
			throw new GameServiceException(HttpStatus.UNAUTHORIZED.value(), CODE_AUTH_REQUIRED,
				"좋아요는 로그인 후 이용할 수 있습니다.");
		}
		String slug = requireSlug(gameSlug);
		if (repository.exists(slug, userId)) {
			repository.delete(slug, userId);
		} else {
			repository.insert(UUID.randomUUID(), slug, userId);
		}
		long count = repository.countByGame(slug);
		boolean liked = repository.exists(slug, userId);
		return new GameLikeStatusResponse(count, liked);
	}

	@Transactional(readOnly = true)
	public GameLikeRankingResponse ranking(int limit) {
		int normalized = limit <= 0 ? MAX_RANKING_LIMIT : Math.min(limit, MAX_RANKING_LIMIT);
		return new GameLikeRankingResponse(
			repository.ranking(normalized).stream()
				.map(row -> new GameLikeRankingResponse.Item(row.gameSlug(), row.count()))
				.toList()
		);
	}

	private static String requireSlug(String gameSlug) {
		String slug = gameSlug == null ? "" : gameSlug.trim();
		if (slug.isEmpty() || slug.length() > MAX_SLUG_LENGTH || !slug.matches("[a-z0-9-]+")) {
			throw new GameServiceException(HttpStatus.BAD_REQUEST.value(), CODE_SLUG_INVALID,
				"gameSlug가 올바르지 않습니다.");
		}
		return slug;
	}
}
