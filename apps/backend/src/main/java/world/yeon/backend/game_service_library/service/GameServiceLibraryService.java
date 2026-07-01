package world.yeon.backend.game_service_library.service;

import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.game_service_common.service.GameServiceException;
import world.yeon.backend.game_service_library.repository.GameServiceLibraryRepository;

@Service
public class GameServiceLibraryService {
	private static final int MAX_SLUG_LENGTH = 80;
	private static final int RECENT_LIMIT = 24;
	private static final String CODE_AUTH_REQUIRED = "GAME_LIBRARY_AUTH_REQUIRED";
	private static final String CODE_SLUG_INVALID = "GAME_SLUG_INVALID";

	private final GameServiceLibraryRepository repository;

	public GameServiceLibraryService(GameServiceLibraryRepository repository) {
		this.repository = repository;
	}

	@Transactional(readOnly = true)
	public List<String> listFavorites(UUID userId) {
		return repository.listFavorites(requireUser(userId));
	}

	@Transactional
	public boolean toggleFavorite(UUID userId, String gameSlug) {
		UUID user = requireUser(userId);
		String slug = requireSlug(gameSlug);
		if (repository.isFavorite(user, slug)) {
			repository.removeFavorite(user, slug);
			return false;
		}
		repository.addFavorite(UUID.randomUUID(), user, slug);
		return true;
	}

	@Transactional
	public void recordPlay(UUID userId, String gameSlug) {
		repository.recordPlay(requireUser(userId), requireSlug(gameSlug));
	}

	@Transactional(readOnly = true)
	public List<String> listRecent(UUID userId) {
		return repository.listRecent(requireUser(userId), RECENT_LIMIT);
	}

	private static UUID requireUser(UUID userId) {
		if (userId == null) {
			throw new GameServiceException(HttpStatus.UNAUTHORIZED.value(), CODE_AUTH_REQUIRED, "로그인이 필요합니다.");
		}
		return userId;
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
