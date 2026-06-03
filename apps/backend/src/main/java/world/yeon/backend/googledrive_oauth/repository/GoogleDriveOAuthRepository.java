package world.yeon.backend.googledrive_oauth.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.oauth_token_security.OAuthTokenSecretProtector;

@Repository
public class GoogleDriveOAuthRepository {
	@PersistenceContext
	private EntityManager entityManager;

	private final OAuthTokenSecretProtector secretProtector;

	public GoogleDriveOAuthRepository(OAuthTokenSecretProtector secretProtector) {
		this.secretProtector = secretProtector;
	}

	public String findRefreshToken(UUID userId) {
		List<?> rows = entityManager.createNativeQuery("""
			select refresh_token, refresh_token_encrypted
			from public.googledrive_tokens
			where user_id = :userId
			limit 1
		""")
			.setParameter("userId", userId)
			.getResultList();
		if (rows.isEmpty()) return null;
		Object[] v = (Object[]) rows.getFirst();
		// 봉투 ciphertext가 있으면 복호화, 없으면(마이그레이션 전 평문 행) 평문 컬럼 fallback.
		String encrypted = secretProtector.reveal((String) v[1]);
		return encrypted != null ? encrypted : (String) v[0];
	}

	@Transactional
	public void upsertTokens(UUID userId, String accessToken, String refreshToken, OffsetDateTime expiresAt, OffsetDateTime now) {
		// 평문 토큰은 봉투 암호화해 *_encrypted 컬럼에만 저장한다. NOT NULL인 평문 컬럼은 빈 문자열로 둬서
		// 스키마 정합을 유지하면서 평문 노출을 제거한다.
		String accessTokenEncrypted = secretProtector.protect(accessToken);
		String refreshTokenEncrypted = refreshToken == null || refreshToken.isBlank() ? null : secretProtector.protect(refreshToken);
		// ON CONFLICT 단일 쿼리로 원자적 upsert(동시 콜백 시 unique 위반 경합 제거).
		// refresh_token_encrypted는 EXCLUDED 값이 비어 있으면 기존 값을 보존해 read-modify-write 윈도우를 닫는다.
		entityManager.createNativeQuery("""
			insert into public.googledrive_tokens
			(public_id, user_id, access_token, refresh_token, access_token_encrypted, refresh_token_encrypted, expires_at, created_at, updated_at)
			values (:publicId, :userId, '', '', :accessTokenEncrypted, :refreshTokenEncrypted, :expiresAt, :createdAt, :updatedAt)
			on conflict (user_id) do update set
			    access_token = '',
			    refresh_token = '',
			    access_token_encrypted = excluded.access_token_encrypted,
			    refresh_token_encrypted = coalesce(excluded.refresh_token_encrypted, public.googledrive_tokens.refresh_token_encrypted),
			    expires_at = excluded.expires_at,
			    updated_at = excluded.updated_at
		""")
			.setParameter("publicId", "gdt_" + UUID.randomUUID())
			.setParameter("userId", userId)
			.setParameter("accessTokenEncrypted", accessTokenEncrypted)
			.setParameter("refreshTokenEncrypted", refreshTokenEncrypted)
			.setParameter("expiresAt", Timestamp.from(expiresAt.toInstant()))
			.setParameter("createdAt", Timestamp.from(now.toInstant()))
			.setParameter("updatedAt", Timestamp.from(now.toInstant()))
			.executeUpdate();
	}
}
