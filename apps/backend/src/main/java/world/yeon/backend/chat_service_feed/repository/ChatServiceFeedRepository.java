package world.yeon.backend.chat_service_feed.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import world.yeon.backend.chat_service_blocks.repository.ChatServiceBlockRelationReader;

@Repository
public class ChatServiceFeedRepository {
	public record FeedPostRow(
		UUID id,
		UUID authorId,
		UUID replyToPostId,
		String body,
		OffsetDateTime createdAt,
		String authorNickname,
		String authorAgeLabel,
		String authorRegionLabel,
		String authorAvatarUrl,
		String authorBio,
		int authorPoints
	) {}

	@PersistenceContext
	private EntityManager entityManager;

	@Autowired
	private ChatServiceBlockRelationReader blockRelationReader;

	public List<FeedPostRow> listRootFeed() {
		List<?> rows = entityManager.createNativeQuery(baseSelect() + " where p.reply_to_post_id is null order by p.created_at desc limit 30").getResultList();
		return rows.stream().map(this::toFeedPostRow).toList();
	}

	public List<FeedPostRow> listReplies(UUID postId) {
		List<?> rows = entityManager.createNativeQuery(baseSelect() + " where p.reply_to_post_id = :postId order by p.created_at desc limit 50")
			.setParameter("postId", postId)
			.getResultList();
		return rows.stream().map(this::toFeedPostRow).toList();
	}

	public Set<UUID> listBlockedRelationIds(UUID currentProfileId) {
		// IDX 47: 양방향 차단 조회는 공용 reader 로 위임한다.
		return blockRelationReader.listBlockedRelationIds(currentProfileId);
	}

	public java.util.Map<UUID, Integer> listReplyCounts(List<UUID> postIds, Set<UUID> blockedRelationIds) {
		if (postIds.isEmpty()) return java.util.Map.of();
		List<?> rows = entityManager.createNativeQuery("""
			select reply_to_post_id, author_id
			from public.chat_service_feed_posts
			where reply_to_post_id = any(:postIds)
		""")
			.setParameter("postIds", postIds.toArray(UUID[]::new))
			.getResultList();
		java.util.Map<UUID, Integer> result = new java.util.HashMap<>();
		for (Object row : rows) {
			Object[] v = (Object[]) row;
			UUID replyToPostId = (UUID) v[0];
			UUID authorId = (UUID) v[1];
			if (replyToPostId == null || blockedRelationIds.contains(authorId)) continue;
			result.put(replyToPostId, result.getOrDefault(replyToPostId, 0) + 1);
		}
		return result;
	}

	public FeedPostRow findFeedPost(UUID postId) {
		List<?> rows = entityManager.createNativeQuery(baseSelect() + " where p.id = :postId limit 1")
			.setParameter("postId", postId)
			.getResultList();
		if (rows.isEmpty()) return null;
		return toFeedPostRow(rows.getFirst());
	}

	public FeedPostRow insertFeedPost(UUID id, UUID authorId, UUID replyToPostId, String body) {
		entityManager.createNativeQuery("""
			insert into public.chat_service_feed_posts (id, author_id, reply_to_post_id, body)
			values (:id, :authorId, :replyToPostId, :body)
		""")
			.setParameter("id", id)
			.setParameter("authorId", authorId)
			.setParameter("replyToPostId", replyToPostId)
			.setParameter("body", body)
			.executeUpdate();
		return findFeedPost(id);
	}

	public FeedPostRow updateFeedPostBody(UUID postId, UUID authorId, String body) {
		entityManager.createNativeQuery("""
			update public.chat_service_feed_posts
			set body = :body
			where id = :postId and author_id = :authorId
		""")
			.setParameter("postId", postId)
			.setParameter("authorId", authorId)
			.setParameter("body", body)
			.executeUpdate();
		return findFeedPost(postId);
	}

	public void deleteReplies(UUID postId) {
		entityManager.createNativeQuery("""
			delete from public.chat_service_feed_posts
			where reply_to_post_id = :postId
		""")
			.setParameter("postId", postId)
			.executeUpdate();
	}

	public int deleteFeedPost(UUID postId, UUID authorId) {
		return entityManager.createNativeQuery("""
			delete from public.chat_service_feed_posts
			where id = :postId and author_id = :authorId
		""")
			.setParameter("postId", postId)
			.setParameter("authorId", authorId)
			.executeUpdate();
	}

	private String baseSelect() {
		return """
			select
				p.id,
				p.author_id,
				p.reply_to_post_id,
				p.body,
				p.created_at,
				a.nickname,
				a.age_label,
				a.region_label,
				a.avatar_url,
				a.bio,
				a.points
			from public.chat_service_feed_posts p
			join public.chat_service_profiles a on a.id = p.author_id
		""";
	}

	private FeedPostRow toFeedPostRow(Object row) {
		Object[] v = (Object[]) row;
		return new FeedPostRow(
			(UUID) v[0],
			(UUID) v[1],
			(UUID) v[2],
			(String) v[3],
			asOffsetDateTime(v[4]),
			(String) v[5],
			(String) v[6],
			(String) v[7],
			(String) v[8],
			(String) v[9],
			((Number) v[10]).intValue()
		);
	}

	private OffsetDateTime asOffsetDateTime(Object value) {
		if (value == null) return null;
		if (value instanceof OffsetDateTime offsetDateTime) return offsetDateTime.withOffsetSameInstant(ZoneOffset.UTC);
		if (value instanceof Timestamp timestamp) return timestamp.toInstant().atOffset(ZoneOffset.UTC);
		return OffsetDateTime.parse(String.valueOf(value));
	}
}
