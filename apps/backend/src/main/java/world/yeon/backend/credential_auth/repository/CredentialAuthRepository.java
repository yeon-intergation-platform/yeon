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
	public record UserAccountRow(
		String userId,
		String email,
		OffsetDateTime emailVerifiedAt,
		boolean hasCredential
	) {}

	public record PasswordResetTokenRow(
		String token,
		String userId
	) {}

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


	public UserAccountRow findAccountByEmail(String email) {
		List<?> rows = entityManager.createNativeQuery("""
			select users.id, users.email, users.email_verified_at,
			       exists(select 1 from public.password_credentials pc where pc.user_id = users.id) as has_credential
			from public.users users
			where lower(users.email) = :email
			limit 1
			""")
			.setParameter("email", email)
			.getResultList();
		return rows.isEmpty() ? null : toUserAccountRow(rows.getFirst());
	}

	public void insertCredentialUser(String userId, String email, String displayName, String passwordHash, String verificationToken, OffsetDateTime expiresAt, OffsetDateTime now) {
		entityManager.createNativeQuery("""
			insert into public.users (id, email, display_name, avatar_url, created_at, updated_at, last_login_at)
			values (cast(:userId as uuid), :email, :displayName, null, :createdAt, :updatedAt, :lastLoginAt)
			""")
			.setParameter("userId", userId)
			.setParameter("email", email)
			.setParameter("displayName", displayName)
			.setParameter("createdAt", Timestamp.from(now.toInstant()))
			.setParameter("updatedAt", Timestamp.from(now.toInstant()))
			.setParameter("lastLoginAt", Timestamp.from(now.toInstant()))
			.executeUpdate();
		insertPasswordCredential(userId, passwordHash, now);
		insertEmailVerificationToken(verificationToken, userId, expiresAt, now);
	}

	public void insertPasswordCredential(String userId, String passwordHash, OffsetDateTime now) {
		entityManager.createNativeQuery("""
			insert into public.password_credentials (user_id, password_hash, password_updated_at, created_at)
			values (cast(:userId as uuid), :passwordHash, :passwordUpdatedAt, :createdAt)
			""")
			.setParameter("userId", userId)
			.setParameter("passwordHash", passwordHash)
			.setParameter("passwordUpdatedAt", Timestamp.from(now.toInstant()))
			.setParameter("createdAt", Timestamp.from(now.toInstant()))
			.executeUpdate();
	}

	public void insertEmailVerificationToken(String token, String userId, OffsetDateTime expiresAt, OffsetDateTime now) {
		entityManager.createNativeQuery("""
			insert into public.email_verification_tokens (token, user_id, expires_at, created_at)
			values (cast(:token as uuid), cast(:userId as uuid), :expiresAt, :createdAt)
			""")
			.setParameter("token", token)
			.setParameter("userId", userId)
			.setParameter("expiresAt", Timestamp.from(expiresAt.toInstant()))
			.setParameter("createdAt", Timestamp.from(now.toInstant()))
			.executeUpdate();
	}

	public String findActiveEmailVerificationUserId(String token, OffsetDateTime now) {
		List<?> rows = entityManager.createNativeQuery("""
			select user_id
			from public.email_verification_tokens
			where token = cast(:token as uuid)
			  and consumed_at is null
			  and expires_at > :now
			limit 1
			""")
			.setParameter("token", token)
			.setParameter("now", Timestamp.from(now.toInstant()))
			.getResultList();
		return rows.isEmpty() ? null : asUuidString(rows.getFirst());
	}

	public void consumeEmailVerificationToken(String token, OffsetDateTime now) {
		entityManager.createNativeQuery("""
			update public.email_verification_tokens
			set consumed_at = :now
			where token = cast(:token as uuid)
			""")
			.setParameter("token", token)
			.setParameter("now", Timestamp.from(now.toInstant()))
			.executeUpdate();
	}

	public void markUserEmailVerified(String userId, OffsetDateTime now) {
		entityManager.createNativeQuery("""
			update public.users
			set email_verified_at = :now,
			    updated_at = :now
			where id = cast(:userId as uuid)
			""")
			.setParameter("userId", userId)
			.setParameter("now", Timestamp.from(now.toInstant()))
			.executeUpdate();
	}

	public void consumeOpenEmailVerificationTokens(String userId, OffsetDateTime now) {
		entityManager.createNativeQuery("""
			update public.email_verification_tokens
			set consumed_at = :now
			where user_id = cast(:userId as uuid)
			  and consumed_at is null
			""")
			.setParameter("userId", userId)
			.setParameter("now", Timestamp.from(now.toInstant()))
			.executeUpdate();
	}

	public void insertPasswordResetToken(String token, String userId, OffsetDateTime expiresAt, OffsetDateTime now) {
		entityManager.createNativeQuery("""
			insert into public.password_reset_tokens (token, user_id, expires_at, created_at)
			values (cast(:token as uuid), cast(:userId as uuid), :expiresAt, :createdAt)
			""")
			.setParameter("token", token)
			.setParameter("userId", userId)
			.setParameter("expiresAt", Timestamp.from(expiresAt.toInstant()))
			.setParameter("createdAt", Timestamp.from(now.toInstant()))
			.executeUpdate();
	}

	public void consumeOpenPasswordResetTokens(String userId, OffsetDateTime now) {
		entityManager.createNativeQuery("""
			update public.password_reset_tokens
			set consumed_at = :now
			where user_id = cast(:userId as uuid)
			  and consumed_at is null
			""")
			.setParameter("userId", userId)
			.setParameter("now", Timestamp.from(now.toInstant()))
			.executeUpdate();
	}

	public PasswordResetTokenRow findActivePasswordResetToken(String token, OffsetDateTime now) {
		List<?> rows = entityManager.createNativeQuery("""
			select token, user_id
			from public.password_reset_tokens
			where token = cast(:token as uuid)
			  and consumed_at is null
			  and expires_at > :now
			limit 1
			""")
			.setParameter("token", token)
			.setParameter("now", Timestamp.from(now.toInstant()))
			.getResultList();
		return rows.isEmpty() ? null : toPasswordResetTokenRow(rows.getFirst());
	}

	public void updatePasswordCredential(String userId, String passwordHash, OffsetDateTime now) {
		entityManager.createNativeQuery("""
			update public.password_credentials
			set password_hash = :passwordHash,
			    password_updated_at = :now
			where user_id = cast(:userId as uuid)
			""")
			.setParameter("userId", userId)
			.setParameter("passwordHash", passwordHash)
			.setParameter("now", Timestamp.from(now.toInstant()))
			.executeUpdate();
	}

	public void deleteAuthSessionsByUserId(String userId) {
		entityManager.createNativeQuery("""
			delete from public.auth_sessions
			where user_id = cast(:userId as uuid)
			""")
			.setParameter("userId", userId)
			.executeUpdate();
	}

	public String findEmailByUserId(String userId) {
		List<?> rows = entityManager.createNativeQuery("""
			select email
			from public.users
			where id = cast(:userId as uuid)
			limit 1
			""")
			.setParameter("userId", userId)
			.getResultList();
		return rows.isEmpty() ? null : (String) rows.getFirst();
	}

	public void deleteFailedLoginAttemptsByEmail(String email) {
		entityManager.createNativeQuery("""
			delete from public.login_attempts
			where email = :email
			  and success = false
			""")
			.setParameter("email", email)
			.executeUpdate();
	}

	private UserAccountRow toUserAccountRow(Object row) {
		if (!(row instanceof Object[] values) || values.length < 4) {
			throw new IllegalStateException("credential account row를 해석하지 못했습니다.");
		}
		return new UserAccountRow(
			asUuidString(values[0]),
			(String) values[1],
			asOffsetDateTime(values[2]),
			Boolean.TRUE.equals(values[3])
		);
	}

	private PasswordResetTokenRow toPasswordResetTokenRow(Object row) {
		if (!(row instanceof Object[] values) || values.length < 2) {
			throw new IllegalStateException("password reset token row를 해석하지 못했습니다.");
		}
		return new PasswordResetTokenRow(asUuidString(values[0]), asUuidString(values[1]));
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
