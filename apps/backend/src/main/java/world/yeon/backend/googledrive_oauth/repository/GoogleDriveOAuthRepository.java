package world.yeon.backend.googledrive_oauth.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class GoogleDriveOAuthRepository {
	@PersistenceContext
	private EntityManager entityManager;

	public String findRefreshToken(UUID userId) {
		List<?> rows = entityManager.createNativeQuery("""
			select refresh_token
			from public.googledrive_tokens
			where user_id = :userId
			limit 1
		""")
			.setParameter("userId", userId)
			.getResultList();
		if (rows.isEmpty()) return null;
		return (String) rows.getFirst();
	}

	@Transactional
	public void upsertTokens(UUID userId, String accessToken, String refreshToken, OffsetDateTime expiresAt, OffsetDateTime now) {
		// ON CONFLICT 단일 쿼리로 원자적 upsert(동시 콜백 시 unique 위반 경합 제거).
		// refresh_token은 EXCLUDED 값이 비어 있으면 기존 값을 보존해 read-modify-write 윈도우를 닫는다.
		entityManager.createNativeQuery("""
			insert into public.googledrive_tokens
			(public_id, user_id, access_token, refresh_token, access_token_encrypted, refresh_token_encrypted, expires_at, created_at, updated_at)
			values (:publicId, :userId, :accessToken, :refreshToken, null, null, :expiresAt, :createdAt, :updatedAt)
			on conflict (user_id) do update set
			    access_token = excluded.access_token,
			    refresh_token = coalesce(nullif(excluded.refresh_token, ''), public.googledrive_tokens.refresh_token),
			    access_token_encrypted = null,
			    refresh_token_encrypted = null,
			    expires_at = excluded.expires_at,
			    updated_at = excluded.updated_at
		""")
			.setParameter("publicId", "gdt_" + UUID.randomUUID())
			.setParameter("userId", userId)
			.setParameter("accessToken", accessToken)
			.setParameter("refreshToken", refreshToken)
			.setParameter("expiresAt", Timestamp.from(expiresAt.toInstant()))
			.setParameter("createdAt", Timestamp.from(now.toInstant()))
			.setParameter("updatedAt", Timestamp.from(now.toInstant()))
			.executeUpdate();
	}
}
