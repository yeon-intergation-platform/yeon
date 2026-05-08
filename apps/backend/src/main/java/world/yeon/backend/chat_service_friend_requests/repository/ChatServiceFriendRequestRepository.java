package world.yeon.backend.chat_service_friend_requests.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

@Repository
@Profile("jdbc")
public class ChatServiceFriendRequestRepository {
	public record FriendLinkRow(UUID id, UUID requesterId, UUID addresseeId, String status) {}

	@PersistenceContext
	private EntityManager entityManager;

	public boolean existsProfile(UUID profileId) {
		return !entityManager.createNativeQuery("select 1 from public.chat_service_profiles where id = :profileId limit 1")
			.setParameter("profileId", profileId)
			.getResultList()
			.isEmpty();
	}

	public boolean hasBlockedRelation(UUID currentProfileId, UUID targetProfileId) {
		return !entityManager.createNativeQuery("""
			select 1 from public.chat_service_blocks
			where (blocker_id = :currentProfileId and blocked_id = :targetProfileId)
			   or (blocker_id = :targetProfileId and blocked_id = :currentProfileId)
			limit 1
		""")
			.setParameter("currentProfileId", currentProfileId)
			.setParameter("targetProfileId", targetProfileId)
			.getResultList()
			.isEmpty();
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
