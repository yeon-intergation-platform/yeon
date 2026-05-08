package world.yeon.backend.chat_service_profiles.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

@Repository
@Profile("jdbc")
public class ChatServiceProfileReadRepository {
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

	public ProfileRow findProfileById(UUID profileId) {
		List<?> rows = entityManager.createNativeQuery("""
			select p.id,
			       p.nickname,
			       p.age_label,
			       p.region_label,
			       p.avatar_url,
			       p.bio,
			       p.points
			from public.chat_service_profiles p
			where p.id = :profileId
			limit 1
		""")
			.setParameter("profileId", profileId)
			.getResultList();
		if (rows.isEmpty()) {
			return null;
		}
		Object[] v = (Object[]) rows.getFirst();
		return new ProfileRow(
			(UUID) v[0],
			(String) v[1],
			(String) v[2],
			(String) v[3],
			(String) v[4],
			(String) v[5],
			((Number) v[6]).intValue()
		);
	}

	public boolean hasBlockedRelation(UUID currentProfileId, UUID targetProfileId) {
		List<?> rows = entityManager.createNativeQuery("""
			select 1
			from public.chat_service_blocks b
			where (b.blocker_id = :currentProfileId and b.blocked_id = :targetProfileId)
			   or (b.blocker_id = :targetProfileId and b.blocked_id = :currentProfileId)
			limit 1
		""")
			.setParameter("currentProfileId", currentProfileId)
			.setParameter("targetProfileId", targetProfileId)
			.getResultList();
		return !rows.isEmpty();
	}
}
