package world.yeon.backend.onedrive_browser.repository;

import jakarta.persistence.EntityManager;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.oauth_token_security.OAuthTokenSecretProtector;

@Repository
public class OneDriveBrowserRepository {
	public record TokenRow(String accessToken, String refreshToken, OffsetDateTime expiresAt) {}

	private final EntityManager entityManager;
	private final OAuthTokenSecretProtector secretProtector;

	public OneDriveBrowserRepository(EntityManager entityManager, OAuthTokenSecretProtector secretProtector) {
		this.entityManager = entityManager;
		this.secretProtector = secretProtector;
	}

	public TokenRow findToken(UUID userId) {
		List<?> rows = entityManager.createNativeQuery("""
			select access_token, refresh_token, access_token_encrypted, refresh_token_encrypted, expires_at
			from public.onedrive_tokens
			where user_id = :userId
			limit 1
		""")
			.setParameter("userId", userId)
			.getResultList();
		if (rows.isEmpty()) return null;
		Object[] v = (Object[]) rows.getFirst();
		// 봉투 ciphertext 우선 복호화, 없으면(마이그레이션 전 평문 행) 평문 컬럼 fallback.
		String accessToken = revealOrPlain((String) v[2], (String) v[0]);
		String refreshToken = revealOrPlain((String) v[3], (String) v[1]);
		return new TokenRow(accessToken, refreshToken, asOffsetDateTime(v[4]));
	}

	@Transactional
	public void updateTokens(UUID userId, String accessToken, String refreshToken, OffsetDateTime expiresAt, OffsetDateTime now) {
		// 평문 토큰은 봉투 암호화해 *_encrypted 컬럼에만 저장하고, NOT NULL 평문 컬럼은 빈 문자열로 비운다.
		String accessTokenEncrypted = secretProtector.protect(accessToken);
		String refreshTokenEncrypted = secretProtector.protect(refreshToken);
		entityManager.createNativeQuery("""
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
	}

	private String revealOrPlain(String encrypted, String plain) {
		String revealed = secretProtector.reveal(encrypted);
		return revealed != null ? revealed : plain;
	}

	private OffsetDateTime asOffsetDateTime(Object value) {
		if (value == null) return null;
		if (value instanceof OffsetDateTime offsetDateTime) return offsetDateTime;
		if (value instanceof Timestamp timestamp) return timestamp.toInstant().atOffset(ZoneOffset.UTC);
		if (value instanceof Instant instant) return instant.atOffset(ZoneOffset.UTC);
		if (value instanceof Date date) return date.toInstant().atOffset(ZoneOffset.UTC);
		if (value instanceof ZonedDateTime zonedDateTime) return zonedDateTime.toOffsetDateTime();
		return OffsetDateTime.parse(value.toString());
	}
}
