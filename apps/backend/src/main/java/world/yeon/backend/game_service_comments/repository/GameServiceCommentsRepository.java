package world.yeon.backend.game_service_comments.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class GameServiceCommentsRepository {
	// guest_password_hash 는 노출하지 않는다(존재 여부만 hasGuestPassword 로 내려준다).
	public record CommentRow(
		UUID id,
		String gameSlug,
		UUID authorUserId,
		String displayName,
		String avatarUrl,
		boolean hasGuestPassword,
		String content,
		boolean isSecret,
		OffsetDateTime createdAt
	) {}

	@PersistenceContext
	private EntityManager entityManager;

	public List<CommentRow> listByGame(String gameSlug) {
		List<?> rows = entityManager.createNativeQuery("""
			select id, game_slug, author_user_id, display_name, avatar_url,
			       (guest_password_hash is not null) as has_guest_password,
			       content, is_secret, created_at
			from public.game_service_comments
			where game_slug = :gameSlug and deleted_at is null
			order by created_at desc
		""")
			.setParameter("gameSlug", gameSlug)
			.getResultList();
		return rows.stream().map(GameServiceCommentsRepository::toRow).toList();
	}

	public CommentRow findById(UUID id) {
		List<?> rows = entityManager.createNativeQuery("""
			select id, game_slug, author_user_id, display_name, avatar_url,
			       (guest_password_hash is not null) as has_guest_password,
			       content, is_secret, created_at
			from public.game_service_comments
			where id = :id and deleted_at is null
			limit 1
		""")
			.setParameter("id", id)
			.getResultList();
		if (rows.isEmpty()) return null;
		return toRow(rows.getFirst());
	}

	public String findGuestPasswordHash(UUID id) {
		List<?> rows = entityManager.createNativeQuery("""
			select guest_password_hash
			from public.game_service_comments
			where id = :id and deleted_at is null
			limit 1
		""")
			.setParameter("id", id)
			.getResultList();
		if (rows.isEmpty()) return null;
		Object value = rows.getFirst();
		return value == null ? null : (String) value;
	}

	public CommentRow insert(
		UUID id,
		String gameSlug,
		UUID authorUserId,
		String displayName,
		String avatarUrl,
		String guestPasswordHash,
		String content,
		boolean isSecret
	) {
		entityManager.createNativeQuery("""
			insert into public.game_service_comments
				(id, game_slug, author_user_id, display_name, avatar_url,
				 guest_password_hash, content, is_secret, created_at)
			values
				(:id, :gameSlug, cast(:authorUserId as uuid), :displayName,
				 cast(:avatarUrl as varchar), cast(:guestPasswordHash as varchar),
				 :content, :isSecret, now())
		""")
			.setParameter("id", id)
			.setParameter("gameSlug", gameSlug)
			.setParameter("authorUserId", authorUserId)
			.setParameter("displayName", displayName)
			.setParameter("avatarUrl", avatarUrl)
			.setParameter("guestPasswordHash", guestPasswordHash)
			.setParameter("content", content)
			.setParameter("isSecret", isSecret)
			.executeUpdate();
		return findById(id);
	}

	public boolean softDelete(UUID id) {
		return entityManager.createNativeQuery("""
			update public.game_service_comments
			set deleted_at = now()
			where id = :id and deleted_at is null
		""")
			.setParameter("id", id)
			.executeUpdate() > 0;
	}

	private static CommentRow toRow(Object raw) {
		Object[] v = (Object[]) raw;
		return new CommentRow(
			(UUID) v[0],
			(String) v[1],
			(UUID) v[2],
			(String) v[3],
			(String) v[4],
			(Boolean) v[5],
			(String) v[6],
			(Boolean) v[7],
			asOffsetDateTime(v[8])
		);
	}

	private static OffsetDateTime asOffsetDateTime(Object value) {
		if (value == null) return null;
		if (value instanceof OffsetDateTime offsetDateTime) return offsetDateTime;
		if (value instanceof Timestamp timestamp) {
			return timestamp.toInstant().atOffset(ZoneOffset.UTC);
		}
		if (value instanceof java.time.Instant instant) {
			return instant.atOffset(ZoneOffset.UTC);
		}
		return null;
	}
}
