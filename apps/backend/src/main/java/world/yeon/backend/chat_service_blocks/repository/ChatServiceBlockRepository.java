package world.yeon.backend.chat_service_blocks.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

@Repository
@Profile("jdbc")
public class ChatServiceBlockRepository {
	public record ProfileRow(
		UUID id,
		String nickname,
		String ageLabel,
		String regionLabel,
		String avatarUrl,
		String bio,
		int points
	) {}

	@PersistenceContext
	private EntityManager entityManager;

	public boolean existsProfile(UUID profileId) {
		return !entityManager.createNativeQuery("select 1 from public.chat_service_profiles where id = :profileId limit 1")
			.setParameter("profileId", profileId)
			.getResultList()
			.isEmpty();
	}

	public boolean existsBlock(UUID blockerId, UUID blockedId) {
		return !entityManager.createNativeQuery("""
			select 1 from public.chat_service_blocks
			where blocker_id = :blockerId and blocked_id = :blockedId
			limit 1
		""")
			.setParameter("blockerId", blockerId)
			.setParameter("blockedId", blockedId)
			.getResultList()
			.isEmpty();
	}

	public void insertBlock(UUID blockId, UUID blockerId, UUID blockedId) {
		entityManager.createNativeQuery("""
			insert into public.chat_service_blocks (id, blocker_id, blocked_id)
			values (:id, :blockerId, :blockedId)
		""")
			.setParameter("id", blockId)
			.setParameter("blockerId", blockerId)
			.setParameter("blockedId", blockedId)
			.executeUpdate();
	}

	public void deleteBlock(UUID blockerId, UUID blockedId) {
		entityManager.createNativeQuery("""
			delete from public.chat_service_blocks
			where blocker_id = :blockerId and blocked_id = :blockedId
		""")
			.setParameter("blockerId", blockerId)
			.setParameter("blockedId", blockedId)
			.executeUpdate();
	}

	public void deleteFriendLinksBetween(UUID currentProfileId, UUID targetProfileId) {
		entityManager.createNativeQuery("""
			delete from public.chat_service_friend_links
			where (requester_id = :currentProfileId and addressee_id = :targetProfileId)
			   or (requester_id = :targetProfileId and addressee_id = :currentProfileId)
		""")
			.setParameter("currentProfileId", currentProfileId)
			.setParameter("targetProfileId", targetProfileId)
			.executeUpdate();
	}

	public List<ProfileRow> listBlockedProfiles(UUID blockerId) {
		return entityManager.createNativeQuery("""
			select p.id,
			       p.nickname,
			       p.age_label,
			       p.region_label,
			       p.avatar_url,
			       p.bio,
			       p.points
			from public.chat_service_blocks b
			join public.chat_service_profiles p on p.id = b.blocked_id
			where b.blocker_id = :blockerId
			order by p.nickname asc
		""")
			.setParameter("blockerId", blockerId)
			.getResultList()
			.stream()
			.map(row -> {
				Object[] v = (Object[]) row;
				return new ProfileRow(
					(UUID) v[0],
					(String) v[1],
					(String) v[2],
					(String) v[3],
					(String) v[4],
					(String) v[5],
					((Number) v[6]).intValue()
				);
			})
			.toList();
	}
}
