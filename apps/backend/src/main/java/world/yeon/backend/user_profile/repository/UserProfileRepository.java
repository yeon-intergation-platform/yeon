package world.yeon.backend.user_profile.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class UserProfileRepository {
	public record ProfileRow(UUID id, String email, String displayName, String avatarUrl) {}

	@PersistenceContext
	private EntityManager entityManager;

	public ProfileRow findProfile(UUID userId) {
		List<?> rows = entityManager.createNativeQuery("""
			select id, email, display_name, avatar_url
			from public.users
			where id = :userId
			limit 1
		""")
			.setParameter("userId", userId)
			.getResultList();
		if (rows.isEmpty()) return null;
		Object[] v = (Object[]) rows.getFirst();
		return new ProfileRow((UUID) v[0], (String) v[1], (String) v[2], (String) v[3]);
	}

	public ProfileRow updateProfile(UUID userId, String displayName, String avatarUrl) {
		int updated = entityManager.createNativeQuery("""
			update public.users
			set display_name = :displayName,
			    avatar_url = cast(:avatarUrl as varchar)
			where id = :userId
		""")
			.setParameter("userId", userId)
			.setParameter("displayName", displayName)
			.setParameter("avatarUrl", avatarUrl)
			.executeUpdate();
		if (updated == 0) return null;
		return findProfile(userId);
	}
}
