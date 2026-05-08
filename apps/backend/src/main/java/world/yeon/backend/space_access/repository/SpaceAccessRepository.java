package world.yeon.backend.space_access.repository;

import jakarta.persistence.EntityManager;
import java.util.List;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

@Repository
@Profile("jdbc")
public class SpaceAccessRepository {
	private final EntityManager entityManager;
	public SpaceAccessRepository(EntityManager entityManager) { this.entityManager = entityManager; }
	public boolean existsOwnedSpace(String spacePublicId, UUID userId) {
		List<?> rows = entityManager.createNativeQuery("""
			select s.id from public.spaces s
			where s.public_id = :spacePublicId and s.created_by_user_id = :userId
			limit 1
			""")
			.setParameter("spacePublicId", spacePublicId)
			.setParameter("userId", userId)
			.getResultList();
		return !rows.isEmpty();
	}
}
