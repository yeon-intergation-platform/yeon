package world.yeon.backend.onedrive_oauth.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@Profile("jdbc")
public class OneDriveOAuthRepository {
	@PersistenceContext
	private EntityManager entityManager;

	@Transactional
	public void upsertTokens(UUID userId, String accessToken, String refreshToken, OffsetDateTime expiresAt, OffsetDateTime now) {
		int updated = entityManager.createNativeQuery("""
			update public.onedrive_tokens
			set access_token = :accessToken,
			    refresh_token = :refreshToken,
			    access_token_encrypted = null,
			    refresh_token_encrypted = null,
			    expires_at = :expiresAt,
			    updated_at = :updatedAt
			where user_id = :userId
		""")
			.setParameter("userId", userId)
			.setParameter("accessToken", accessToken)
			.setParameter("refreshToken", refreshToken)
			.setParameter("expiresAt", Timestamp.from(expiresAt.toInstant()))
			.setParameter("updatedAt", Timestamp.from(now.toInstant()))
			.executeUpdate();
		if (updated > 0) return;
		entityManager.createNativeQuery("""
			insert into public.onedrive_tokens
			(public_id, user_id, access_token, refresh_token, access_token_encrypted, refresh_token_encrypted, expires_at, created_at, updated_at)
			values (:publicId, :userId, :accessToken, :refreshToken, null, null, :expiresAt, :createdAt, :updatedAt)
		""")
			.setParameter("publicId", "odt_" + UUID.randomUUID())
			.setParameter("userId", userId)
			.setParameter("accessToken", accessToken)
			.setParameter("refreshToken", refreshToken)
			.setParameter("expiresAt", Timestamp.from(expiresAt.toInstant()))
			.setParameter("createdAt", Timestamp.from(now.toInstant()))
			.setParameter("updatedAt", Timestamp.from(now.toInstant()))
			.executeUpdate();
	}
}
