package world.yeon.backend.game_service_library.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class GameServiceLibraryRepository {

	@PersistenceContext
	private EntityManager entityManager;

	// --- 찜(즐겨찾기) ---

	public List<String> listFavorites(UUID userId) {
		List<?> rows = entityManager.createNativeQuery("""
			select game_slug from public.game_service_favorites
			where user_id = :userId
			order by created_at desc
		""")
			.setParameter("userId", userId)
			.getResultList();
		return rows.stream().map(value -> (String) value).toList();
	}

	public boolean isFavorite(UUID userId, String gameSlug) {
		Object value = entityManager.createNativeQuery("""
			select count(*) from public.game_service_favorites
			where user_id = :userId and game_slug = :gameSlug
		""")
			.setParameter("userId", userId)
			.setParameter("gameSlug", gameSlug)
			.getSingleResult();
		return ((Number) value).longValue() > 0;
	}

	public void addFavorite(UUID id, UUID userId, String gameSlug) {
		entityManager.createNativeQuery("""
			insert into public.game_service_favorites (id, user_id, game_slug, created_at)
			values (:id, :userId, :gameSlug, now())
			on conflict (user_id, game_slug) do nothing
		""")
			.setParameter("id", id)
			.setParameter("userId", userId)
			.setParameter("gameSlug", gameSlug)
			.executeUpdate();
	}

	public boolean removeFavorite(UUID userId, String gameSlug) {
		return entityManager.createNativeQuery("""
			delete from public.game_service_favorites
			where user_id = :userId and game_slug = :gameSlug
		""")
			.setParameter("userId", userId)
			.setParameter("gameSlug", gameSlug)
			.executeUpdate() > 0;
	}

	// --- 최근 플레이 ---

	public void recordPlay(UUID userId, String gameSlug) {
		entityManager.createNativeQuery("""
			insert into public.game_service_play_history (user_id, game_slug, played_at)
			values (:userId, :gameSlug, now())
			on conflict (user_id, game_slug) do update set played_at = now()
		""")
			.setParameter("userId", userId)
			.setParameter("gameSlug", gameSlug)
			.executeUpdate();
	}

	public List<String> listRecent(UUID userId, int limit) {
		List<?> rows = entityManager.createNativeQuery("""
			select game_slug from public.game_service_play_history
			where user_id = :userId
			order by played_at desc
			limit :limit
		""")
			.setParameter("userId", userId)
			.setParameter("limit", limit)
			.getResultList();
		return rows.stream().map(value -> (String) value).toList();
	}
}
