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

@Repository
public class OneDriveBrowserRepository {
	public record TokenRow(String accessToken, String refreshToken, OffsetDateTime expiresAt) {}

	private final EntityManager entityManager;

	public OneDriveBrowserRepository(EntityManager entityManager) {
		this.entityManager = entityManager;
	}

	public TokenRow findToken(UUID userId) {
		List<?> rows = entityManager.createNativeQuery("""
			select access_token, refresh_token, expires_at
			from public.onedrive_tokens
			where user_id = :userId
			limit 1
		""")
			.setParameter("userId", userId)
			.getResultList();
		if (rows.isEmpty()) return null;
		Object[] v = (Object[]) rows.getFirst();
		return new TokenRow((String) v[0], (String) v[1], asOffsetDateTime(v[2]));
	}

	@Transactional
	public void updateTokens(UUID userId, String accessToken, String refreshToken, OffsetDateTime expiresAt, OffsetDateTime now) {
		entityManager.createNativeQuery("""
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
