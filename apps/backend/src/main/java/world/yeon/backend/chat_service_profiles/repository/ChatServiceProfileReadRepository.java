package world.yeon.backend.chat_service_profiles.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import world.yeon.backend.chat_service_blocks.repository.ChatServiceBlockRelationReader;

@Repository
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

	@Autowired
	private ChatServiceBlockRelationReader blockRelationReader;

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
		// IDX 47: 양방향 차단 조회는 공용 reader 로 위임한다.
		return blockRelationReader.hasBlockedRelation(currentProfileId, targetProfileId);
	}
}
