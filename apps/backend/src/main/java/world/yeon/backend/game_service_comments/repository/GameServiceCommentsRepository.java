package world.yeon.backend.game_service_comments.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
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
		long likeCount,
		OffsetDateTime createdAt
	) {}

	private static final String COMMENT_COLUMNS = """
		id, game_slug, author_user_id, display_name, avatar_url,
		(guest_password_hash is not null) as has_guest_password,
		content, is_secret,
		(select count(*) from public.game_service_comment_likes l where l.comment_id = c.id) as like_count,
		created_at
	""";

	@PersistenceContext
	private EntityManager entityManager;

	public List<CommentRow> listByGame(String gameSlug, boolean sortPopular) {
		String order = sortPopular
			? "order by like_count desc, created_at desc"
			: "order by created_at desc";
		List<?> rows = entityManager.createNativeQuery("""
			select %s
			from public.game_service_comments c
			where c.game_slug = :gameSlug and c.deleted_at is null
			%s
		""".formatted(COMMENT_COLUMNS, order))
			.setParameter("gameSlug", gameSlug)
			.getResultList();
		return rows.stream().map(GameServiceCommentsRepository::toRow).toList();
	}

	public CommentRow findById(UUID id) {
		List<?> rows = entityManager.createNativeQuery("""
			select %s
			from public.game_service_comments c
			where c.id = :id and c.deleted_at is null
			limit 1
		""".formatted(COMMENT_COLUMNS))
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

	// --- 댓글 좋아요 ---

	public boolean commentExists(UUID commentId) {
		Object value = entityManager.createNativeQuery("""
			select count(*) from public.game_service_comments
			where id = :id and deleted_at is null
		""")
			.setParameter("id", commentId)
			.getSingleResult();
		return ((Number) value).longValue() > 0;
	}

	public boolean commentLikeExists(UUID commentId, UUID userId) {
		Object value = entityManager.createNativeQuery("""
			select count(*) from public.game_service_comment_likes
			where comment_id = :commentId and user_id = :userId
		""")
			.setParameter("commentId", commentId)
			.setParameter("userId", userId)
			.getSingleResult();
		return ((Number) value).longValue() > 0;
	}

	public void addCommentLike(UUID id, UUID commentId, UUID userId) {
		entityManager.createNativeQuery("""
			insert into public.game_service_comment_likes (id, comment_id, user_id, created_at)
			values (:id, :commentId, :userId, now())
			on conflict (comment_id, user_id) do nothing
		""")
			.setParameter("id", id)
			.setParameter("commentId", commentId)
			.setParameter("userId", userId)
			.executeUpdate();
	}

	public void removeCommentLike(UUID commentId, UUID userId) {
		entityManager.createNativeQuery("""
			delete from public.game_service_comment_likes
			where comment_id = :commentId and user_id = :userId
		""")
			.setParameter("commentId", commentId)
			.setParameter("userId", userId)
			.executeUpdate();
	}

	public long countCommentLikes(UUID commentId) {
		Object value = entityManager.createNativeQuery("""
			select count(*) from public.game_service_comment_likes where comment_id = :commentId
		""")
			.setParameter("commentId", commentId)
			.getSingleResult();
		return ((Number) value).longValue();
	}

	// 이 게임의 댓글 중 사용자가 좋아요한 댓글 id 집합(목록 1회 조회로 likedByMe 판정).
	public Set<UUID> likedCommentIds(String gameSlug, UUID userId) {
		List<?> rows = entityManager.createNativeQuery("""
			select l.comment_id
			from public.game_service_comment_likes l
			join public.game_service_comments c on c.id = l.comment_id
			where c.game_slug = :gameSlug and l.user_id = :userId
		""")
			.setParameter("gameSlug", gameSlug)
			.setParameter("userId", userId)
			.getResultList();
		return rows.stream().map(value -> (UUID) value).collect(Collectors.toSet());
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
			((Number) v[8]).longValue(),
			asOffsetDateTime(v[9])
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
