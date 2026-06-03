package world.yeon.backend.chat_service_friend_requests.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import world.yeon.backend.chat_service_blocks.repository.ChatServiceBlockRelationReader;

@Repository
public class ChatServiceFriendRequestRepository {
	public record FriendLinkRow(UUID id, UUID requesterId, UUID addresseeId, String status) {}

	@PersistenceContext
	private EntityManager entityManager;

	@Autowired
	private ChatServiceBlockRelationReader blockRelationReader;

	public boolean existsProfile(UUID profileId) {
		return !entityManager.createNativeQuery("select 1 from public.chat_service_profiles where id = :profileId limit 1")
			.setParameter("profileId", profileId)
			.getResultList()
			.isEmpty();
	}

	public boolean hasBlockedRelation(UUID currentProfileId, UUID targetProfileId) {
		// IDX 47: 양방향 차단 조회는 공용 reader 로 위임한다.
		return blockRelationReader.hasBlockedRelation(currentProfileId, targetProfileId);
	}

	public FriendLinkRow findLinkBetween(UUID currentProfileId, UUID targetProfileId) {
		List<?> rows = entityManager.createNativeQuery("""
			select id, requester_id, addressee_id, status
			from public.chat_service_friend_links
			where (requester_id = :currentProfileId and addressee_id = :targetProfileId)
			   or (requester_id = :targetProfileId and addressee_id = :currentProfileId)
			limit 1
		""")
			.setParameter("currentProfileId", currentProfileId)
			.setParameter("targetProfileId", targetProfileId)
			.getResultList();
		if (rows.isEmpty()) return null;
		Object[] v = (Object[]) rows.getFirst();
		return new FriendLinkRow((UUID) v[0], (UUID) v[1], (UUID) v[2], (String) v[3]);
	}

	public void insertPendingLink(UUID id, UUID requesterId, UUID addresseeId) {
		entityManager.createNativeQuery("""
			insert into public.chat_service_friend_links (id, requester_id, addressee_id, status)
			values (:id, :requesterId, :addresseeId, 'pending')
			on conflict (requester_id, addressee_id) do nothing
		""")
			.setParameter("id", id)
			.setParameter("requesterId", requesterId)
			.setParameter("addresseeId", addresseeId)
			.executeUpdate();
	}

	public void acceptLink(UUID id) {
		entityManager.createNativeQuery("""
			update public.chat_service_friend_links
			set status = 'accepted', updated_at = :updatedAt
			where id = :id
		""")
			.setParameter("id", id)
			.setParameter("updatedAt", Timestamp.from(Instant.now()))
			.executeUpdate();
	}
}
