package world.yeon.backend.onedrive_oauth.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.oauth_token_security.OAuthTokenSecretProtector;

@Repository
public class OneDriveOAuthRepository {
	@PersistenceContext
	private EntityManager entityManager;

	private final OAuthTokenSecretProtector secretProtector;

	public OneDriveOAuthRepository(OAuthTokenSecretProtector secretProtector) {
		this.secretProtector = secretProtector;
	}

	@Transactional
	public void upsertTokens(UUID userId, String accessToken, String refreshToken, OffsetDateTime expiresAt, OffsetDateTime now) {
		// 평문 토큰은 봉투 암호화해 *_encrypted 컬럼에만 저장하고, NOT NULL 평문 컬럼은 빈 문자열로 비운다.
		String accessTokenEncrypted = secretProtector.protect(accessToken);
		String refreshTokenEncrypted = secretProtector.protect(refreshToken);
		int updated = entityManager.createNativeQuery("""
			update public.onedrive_tokens
			set access_token = '',
			    refresh_token = '',
			    access_token_encrypted = :accessTokenEncrypted,
			    refresh_token_encrypted = :refreshTokenEncrypted,
			    expires_at = :expiresAt,
			    updated_at = :updatedAt
			where user_id = :userId
		""")
			.setParameter("userId", userId)
			.setParameter("accessTokenEncrypted", accessTokenEncrypted)
			.setParameter("refreshTokenEncrypted", refreshTokenEncrypted)
			.setParameter("expiresAt", Timestamp.from(expiresAt.toInstant()))
			.setParameter("updatedAt", Timestamp.from(now.toInstant()))
			.executeUpdate();
		if (updated > 0) return;
		entityManager.createNativeQuery("""
			insert into public.onedrive_tokens
			(public_id, user_id, access_token, refresh_token, access_token_encrypted, refresh_token_encrypted, expires_at, created_at, updated_at)
			values (:publicId, :userId, '', '', :accessTokenEncrypted, :refreshTokenEncrypted, :expiresAt, :createdAt, :updatedAt)
		""")
			.setParameter("publicId", "odt_" + UUID.randomUUID())
			.setParameter("userId", userId)
			.setParameter("accessTokenEncrypted", accessTokenEncrypted)
			.setParameter("refreshTokenEncrypted", refreshTokenEncrypted)
			.setParameter("expiresAt", Timestamp.from(expiresAt.toInstant()))
			.setParameter("createdAt", Timestamp.from(now.toInstant()))
			.setParameter("updatedAt", Timestamp.from(now.toInstant()))
			.executeUpdate();
	}
}
