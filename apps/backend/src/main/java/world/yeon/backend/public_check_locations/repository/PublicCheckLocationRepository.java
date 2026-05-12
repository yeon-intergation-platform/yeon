package world.yeon.backend.public_check_locations.repository;

import jakarta.persistence.EntityManager;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class PublicCheckLocationRepository {
	private final EntityManager entityManager;

	public PublicCheckLocationRepository(EntityManager entityManager) {
		this.entityManager = entityManager;
	}

	public boolean isOwnedSpace(UUID userId, String spaceId) {
		List<?> rows = entityManager.createNativeQuery("""
			select id
			from public.spaces
			where public_id = :spaceId
			  and created_by_user_id = :userId
			limit 1
			""")
			.setParameter("spaceId", spaceId)
			.setParameter("userId", userId)
			.getResultList();
		return !rows.isEmpty();
	}
}
