package world.yeon.backend.game_service_likes.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class GameServiceLikesRepository {
	public record RankingRow(String gameSlug, long count) {}

	@PersistenceContext
	private EntityManager entityManager;

	public long countByGame(String gameSlug) {
		Object value = entityManager.createNativeQuery("""
			select count(*) from public.game_service_likes where game_slug = :gameSlug
		""")
			.setParameter("gameSlug", gameSlug)
			.getSingleResult();
		return ((Number) value).longValue();
	}

	public boolean exists(String gameSlug, UUID userId) {
		Object value = entityManager.createNativeQuery("""
			select count(*) from public.game_service_likes
			where game_slug = :gameSlug and user_id = :userId
		""")
			.setParameter("gameSlug", gameSlug)
			.setParameter("userId", userId)
			.getSingleResult();
		return ((Number) value).longValue() > 0;
	}

	public void insert(UUID id, String gameSlug, UUID userId) {
		entityManager.createNativeQuery("""
			insert into public.game_service_likes (id, game_slug, user_id, created_at)
			values (:id, :gameSlug, :userId, now())
			on conflict (game_slug, user_id) do nothing
		""")
			.setParameter("id", id)
			.setParameter("gameSlug", gameSlug)
			.setParameter("userId", userId)
			.executeUpdate();
	}

	public boolean delete(String gameSlug, UUID userId) {
		return entityManager.createNativeQuery("""
			delete from public.game_service_likes
			where game_slug = :gameSlug and user_id = :userId
		""")
			.setParameter("gameSlug", gameSlug)
			.setParameter("userId", userId)
			.executeUpdate() > 0;
	}

	public List<RankingRow> ranking(int limit) {
		List<?> rows = entityManager.createNativeQuery("""
			select game_slug, count(*) as like_count
			from public.game_service_likes
			group by game_slug
			order by like_count desc
			limit :limit
		""")
			.setParameter("limit", limit)
			.getResultList();
		return rows.stream().map(row -> {
			Object[] v = (Object[]) row;
			return new RankingRow((String) v[0], ((Number) v[1]).longValue());
		}).toList();
	}
}
