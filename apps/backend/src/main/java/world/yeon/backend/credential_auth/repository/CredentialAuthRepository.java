package world.yeon.backend.credential_auth.repository;

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
public class CredentialAuthRepository {
	public record UserCredentialRow(
		String userId,
		String email,
		String passwordHash,
		OffsetDateTime emailVerifiedAt
	) {}

	private final EntityManager entityManager;

	public CredentialAuthRepository(EntityManager entityManager) {
		this.entityManager = entityManager;
	}

	public int countIpAttemptsSince(String ipAddress, OffsetDateTime since) {
		Object value = entityManager.createNativeQuery("""
			select count(*)
			from public.login_attempts
			where ip_address = :ipAddress
			  and attempted_at >= :since
			""")
			.setParameter("ipAddress", ipAddress)
			.setParameter("since", Timestamp.from(since.toInstant()))
			.getSingleResult();
		return asNumber(value).intValue();
	}

	public int countFailedEmailAttemptsSince(String email, OffsetDateTime since) {
		Object value = entityManager.createNativeQuery("""
			select count(*)
			from public.login_attempts
			where email = :email
			  and success = false
			  and attempted_at >= :since
			""")
			.setParameter("email", email)
			.setParameter("since", Timestamp.from(since.toInstant()))
			.getSingleResult();
		return asNumber(value).intValue();
	}

	public UserCredentialRow findCredentialByEmail(String email) {
		List<?> rows = entityManager.createNativeQuery("""
			select users.id, users.email, password_credentials.password_hash, users.email_verified_at
			from public.users users
			left join public.password_credentials password_credentials
			  on password_credentials.user_id = users.id
			where lower(users.email) = :email
			limit 1
			""")
			.setParameter("email", email)
			.getResultList();
		return rows.isEmpty() ? null : toUserCredentialRow(rows.getFirst());
	}

	public void recordLoginAttempt(String email, String ipAddress, boolean success, OffsetDateTime now) {
		entityManager.createNativeQuery("""
			insert into public.login_attempts (email, ip_address, success, attempted_at)
			values (:email, :ipAddress, :success, :attemptedAt)
			""")
			.setParameter("email", email)
			.setParameter("ipAddress", ipAddress)
			.setParameter("success", success)
			.setParameter("attemptedAt", Timestamp.from(now.toInstant()))
			.executeUpdate();
	}

	public void updateLastLoginAt(String userId, OffsetDateTime now) {
		entityManager.createNativeQuery("""
			update public.users
			set last_login_at = :now,
			    updated_at = :now
			where id = cast(:userId as uuid)
			""")
			.setParameter("userId", userId)
			.setParameter("now", Timestamp.from(now.toInstant()))
			.executeUpdate();
	}

	public void insertAuthSession(String id, String userId, String tokenHash, OffsetDateTime expiresAt, OffsetDateTime now) {
		entityManager.createNativeQuery("""
			insert into public.auth_sessions (id, user_id, session_token_hash, expires_at, created_at, last_accessed_at)
			values (cast(:id as uuid), cast(:userId as uuid), :tokenHash, :expiresAt, :createdAt, :lastAccessedAt)
			""")
			.setParameter("id", id)
			.setParameter("userId", userId)
			.setParameter("tokenHash", tokenHash)
			.setParameter("expiresAt", Timestamp.from(expiresAt.toInstant()))
			.setParameter("createdAt", Timestamp.from(now.toInstant()))
			.setParameter("lastAccessedAt", Timestamp.from(now.toInstant()))
			.executeUpdate();
	}

	private UserCredentialRow toUserCredentialRow(Object row) {
		if (!(row instanceof Object[] values) || values.length < 4) {
			throw new IllegalStateException("credential auth row를 해석하지 못했습니다.");
		}
		return new UserCredentialRow(
			asUuidString(values[0]),
			(String) values[1],
			(String) values[2],
			asOffsetDateTime(values[3])
		);
	}

	private Number asNumber(Object value) {
		if (value instanceof Number number) {
			return number;
		}
		return Long.parseLong(value.toString());
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
