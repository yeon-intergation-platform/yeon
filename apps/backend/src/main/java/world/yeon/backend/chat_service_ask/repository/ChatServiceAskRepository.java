package world.yeon.backend.chat_service_ask.repository;

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
public class ChatServiceAskRepository {
	public record AskPostRow(
		UUID id,
		UUID authorId,
		String question,
		String kind,
		String optionsJson,
		OffsetDateTime createdAt,
		String authorNickname,
		String authorAgeLabel,
		String authorRegionLabel,
		String authorAvatarUrl,
		String authorBio,
		int authorPoints
	) {}
	public record AskVoteRow(UUID id, UUID postId, UUID voterId, int optionIndex) {}

	@PersistenceContext
	private EntityManager entityManager;

	@Autowired
	private ChatServiceBlockRelationReader blockRelationReader;

	public List<AskPostRow> listAskPosts() {
		List<?> rows = entityManager.createNativeQuery(baseSelect() + " order by p.created_at desc limit 30").getResultList();
		return rows.stream().map(this::toAskPostRow).toList();
	}

	public Set<UUID> listBlockedRelationIds(UUID currentProfileId) {
		// IDX 47: 양방향 차단 조회는 공용 reader 로 위임한다.
		return blockRelationReader.listBlockedRelationIds(currentProfileId);
	}

	public List<AskVoteRow> listVotes(List<UUID> postIds) {
		if (postIds.isEmpty()) return List.of();
		List<?> rows = entityManager.createNativeQuery("""
			select id, post_id, voter_id, option_index
			from public.chat_service_ask_votes
			where post_id = any(:postIds)
		""")
			.setParameter("postIds", postIds.toArray(UUID[]::new))
			.getResultList();
		return rows.stream().map(this::toAskVoteRow).toList();
	}

	public AskPostRow insertAskPost(UUID id, UUID authorId, String question, String kind, String optionsJson) {
		entityManager.createNativeQuery("""
			insert into public.chat_service_ask_posts (id, author_id, question, kind, options_json)
			values (:id, :authorId, :question, :kind, :optionsJson)
		""")
			.setParameter("id", id)
			.setParameter("authorId", authorId)
			.setParameter("question", question)
			.setParameter("kind", kind)
			.setParameter("optionsJson", optionsJson)
			.executeUpdate();
		return findAskPost(id);
	}

	public AskPostRow findAskPost(UUID postId) {
		List<?> rows = entityManager.createNativeQuery(baseSelect() + " where p.id = :postId limit 1")
			.setParameter("postId", postId)
			.getResultList();
		if (rows.isEmpty()) return null;
		return toAskPostRow(rows.getFirst());
	}

	public AskVoteRow findVote(UUID postId, UUID voterId) {
		List<?> rows = entityManager.createNativeQuery("""
			select id, post_id, voter_id, option_index
			from public.chat_service_ask_votes
			where post_id = :postId and voter_id = :voterId
			limit 1
		""")
			.setParameter("postId", postId)
			.setParameter("voterId", voterId)
			.getResultList();
		if (rows.isEmpty()) return null;
		return toAskVoteRow(rows.getFirst());
	}

	public void updateVote(UUID voteId, int optionIndex) {
		entityManager.createNativeQuery("update public.chat_service_ask_votes set option_index = :optionIndex where id = :voteId")
			.setParameter("voteId", voteId)
			.setParameter("optionIndex", optionIndex)
			.executeUpdate();
	}

	public void insertVote(UUID id, UUID postId, UUID voterId, int optionIndex) {
		entityManager.createNativeQuery("""
			insert into public.chat_service_ask_votes (id, post_id, voter_id, option_index)
			values (:id, :postId, :voterId, :optionIndex)
		""")
			.setParameter("id", id)
			.setParameter("postId", postId)
			.setParameter("voterId", voterId)
			.setParameter("optionIndex", optionIndex)
			.executeUpdate();
	}

	private String baseSelect() {
		return """
			select
				p.id,
				p.author_id,
				p.question,
				p.kind,
				p.options_json,
				p.created_at,
				a.nickname,
				a.age_label,
				a.region_label,
				a.avatar_url,
				a.bio,
				a.points
			from public.chat_service_ask_posts p
			join public.chat_service_profiles a on a.id = p.author_id
		""";
	}

	private AskPostRow toAskPostRow(Object row) {
		Object[] v = (Object[]) row;
		return new AskPostRow((UUID) v[0], (UUID) v[1], (String) v[2], (String) v[3], (String) v[4], asOffsetDateTime(v[5]), (String) v[6], (String) v[7], (String) v[8], (String) v[9], (String) v[10], ((Number) v[11]).intValue());
	}

	private AskVoteRow toAskVoteRow(Object row) {
		Object[] v = (Object[]) row;
		return new AskVoteRow((UUID) v[0], (UUID) v[1], (UUID) v[2], ((Number) v[3]).intValue());
	}

	private OffsetDateTime asOffsetDateTime(Object value) {
		if (value == null) return null;
		if (value instanceof OffsetDateTime offsetDateTime) return offsetDateTime;
		if (value instanceof Timestamp timestamp) return timestamp.toInstant().atOffset(ZoneOffset.UTC);
		return OffsetDateTime.parse(String.valueOf(value));
	}
}
