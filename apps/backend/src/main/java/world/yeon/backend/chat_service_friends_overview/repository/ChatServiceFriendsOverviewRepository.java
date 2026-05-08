package world.yeon.backend.chat_service_friends_overview.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

@Repository
@Profile("jdbc")
public class ChatServiceFriendsOverviewRepository {
	public record ProfileRow(UUID id, String nickname, String ageLabel, String regionLabel, String avatarUrl, String bio, int points) {}
	public record FriendLinkRow(UUID requesterId, UUID addresseeId, String status) {}
	public record BlockPairRow(UUID blockerId, UUID blockedId) {}

	@PersistenceContext
	private EntityManager entityManager;

	public List<FriendLinkRow> listLinks(UUID currentProfileId) {
		return entityManager.createNativeQuery("""
			select requester_id, addressee_id, status
			from public.chat_service_friend_links
			where requester_id = :currentProfileId or addressee_id = :currentProfileId
			order by updated_at desc
		""")
			.setParameter("currentProfileId", currentProfileId)
			.getResultList()
			.stream()
			.map(row -> {
				Object[] v = (Object[]) row;
				return new FriendLinkRow((UUID) v[0], (UUID) v[1], (String) v[2]);
			})
			.toList();
	}

	public List<BlockPairRow> listBlockPairs(UUID currentProfileId) {
		return entityManager.createNativeQuery("""
			select blocker_id, blocked_id
			from public.chat_service_blocks
			where blocker_id = :currentProfileId or blocked_id = :currentProfileId
		""")
			.setParameter("currentProfileId", currentProfileId)
			.getResultList()
			.stream()
			.map(row -> {
				Object[] v = (Object[]) row;
				return new BlockPairRow((UUID) v[0], (UUID) v[1]);
			})
			.toList();
	}

	public List<ProfileRow> listProfilesByIds(Set<UUID> ids) {
		if (ids.isEmpty()) return List.of();
		return entityManager.createNativeQuery("""
			select id, nickname, age_label, region_label, avatar_url, bio, points
			from public.chat_service_profiles
			where id in (:ids)
		""")
			.setParameter("ids", ids)
			.getResultList()
			.stream()
			.map(this::toProfileRow)
			.toList();
	}

	public List<ProfileRow> listBlockedProfiles(UUID currentProfileId) {
		return entityManager.createNativeQuery("""
			select p.id, p.nickname, p.age_label, p.region_label, p.avatar_url, p.bio, p.points
			from public.chat_service_blocks b
			join public.chat_service_profiles p on p.id = b.blocked_id
			where b.blocker_id = :currentProfileId
			order by p.nickname asc
		""")
			.setParameter("currentProfileId", currentProfileId)
			.getResultList()
			.stream()
			.map(this::toProfileRow)
			.toList();
	}

	public List<ProfileRow> listSuggestedProfiles() {
		return entityManager.createNativeQuery("""
			select id, nickname, age_label, region_label, avatar_url, bio, points
			from public.chat_service_profiles
			order by nickname asc
			limit 20
		""")
			.getResultList()
			.stream()
			.map(this::toProfileRow)
			.toList();
	}

	private ProfileRow toProfileRow(Object row) {
		Object[] v = (Object[]) row;
		return new ProfileRow((UUID) v[0], (String) v[1], (String) v[2], (String) v[3], (String) v[4], (String) v[5], ((Number) v[6]).intValue());
	}
}
