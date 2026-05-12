package world.yeon.backend.root_auth.repository;

import jakarta.persistence.EntityManager;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class AuthSessionRepository {

	public record SessionRow(
		String id,
		String userId,
		OffsetDateTime expiresAt
	) {}

	public record UserRow(
		String id,
		String email,
		String displayName,
		String avatarUrl,
		OffsetDateTime lastLoginAt
	) {}

	private final EntityManager entityManager;

	public AuthSessionRepository(EntityManager entityManager) {
		this.entityManager = entityManager;
	}

	public SessionRow findSessionByTokenHash(String tokenHash) {
		List<?> rows = entityManager.createNativeQuery("""
			select id, user_id, expires_at
			from public.auth_sessions
			where session_token_hash = :tokenHash
			limit 1
			""")
			.setParameter("tokenHash", tokenHash)
			.getResultList();
		return rows.isEmpty() ? null : toSessionRow(rows.getFirst());
	}

	public UserRow findUserById(String userId) {
		List<?> rows = entityManager.createNativeQuery("""
			select id, email, display_name, avatar_url, last_login_at
			from public.users
			where id = cast(:userId as uuid)
			limit 1
			""")
			.setParameter("userId", userId)
			.getResultList();
		return rows.isEmpty() ? null : toUserRow(rows.getFirst());
	}

	public List<String> listProvidersByUserId(String userId) {
		return entityManager.createNativeQuery("""
			select distinct provider
			from public.user_identities
			where user_id = cast(:userId as uuid)
			order by provider asc
			""")
			.setParameter("userId", userId)
			.getResultList()
			.stream()
			.map(String.class::cast)
			.toList();
	}

	public void touchSession(String sessionId, OffsetDateTime now) {
		entityManager.createNativeQuery("""
			update public.auth_sessions
			set last_accessed_at = :now
			where id = cast(:sessionId as uuid)
			""")
			.setParameter("sessionId", sessionId)
			.setParameter("now", Timestamp.from(now.toInstant()))
			.executeUpdate();
	}

	public void deleteSessionById(String sessionId) {
		entityManager.createNativeQuery("""
			delete from public.auth_sessions
			where id = cast(:sessionId as uuid)
			""")
			.setParameter("sessionId", sessionId)
			.executeUpdate();
	}

	public void deleteSessionByTokenHash(String tokenHash) {
		entityManager.createNativeQuery("""
			delete from public.auth_sessions
			where session_token_hash = :tokenHash
			""")
			.setParameter("tokenHash", tokenHash)
			.executeUpdate();
	}

	private SessionRow toSessionRow(Object row) {
		if (!(row instanceof Object[] values) || values.length < 3) {
			throw new IllegalStateException("auth session row를 해석하지 못했습니다.");
		}
		return new SessionRow(
			asUuidString(values[0]),
			asUuidString(values[1]),
			asOffsetDateTime(values[2])
		);
	}

	private UserRow toUserRow(Object row) {
		if (!(row instanceof Object[] values) || values.length < 5) {
			throw new IllegalStateException("auth user row를 해석하지 못했습니다.");
		}
		return new UserRow(
			asUuidString(values[0]),
			(String) values[1],
			(String) values[2],
			(String) values[3],
			asOffsetDateTime(values[4])
		);
	}

	private String asUuidString(Object value) {
		if (value == null) return null;
		if (value instanceof UUID uuid) return uuid.toString();
		return value.toString();
	}

	private OffsetDateTime asOffsetDateTime(Object value) {
		if (value == null) return null;
		if (value instanceof OffsetDateTime offsetDateTime) return offsetDateTime;
		if (value instanceof Timestamp timestamp) return timestamp.toInstant().atOffset(ZoneOffset.UTC);
		if (value instanceof Instant instant) return instant.atOffset(ZoneOffset.UTC);
		if (value instanceof Date date) return date.toInstant().atOffset(ZoneOffset.UTC);
		if (value instanceof LocalDateTime localDateTime) return localDateTime.atOffset(ZoneOffset.UTC);
		if (value instanceof ZonedDateTime zonedDateTime) return zonedDateTime.toOffsetDateTime();
		return OffsetDateTime.parse(value.toString());
	}
}
