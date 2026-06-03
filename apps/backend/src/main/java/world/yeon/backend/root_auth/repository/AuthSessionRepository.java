package world.yeon.backend.root_auth.repository;

import jakarta.persistence.EntityManager;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class AuthSessionRepository {

	public record SessionRow(
		String id,
		String userId,
		OffsetDateTime expiresAt,
		OffsetDateTime lastAccessedAt
	) {}

	public record UserRow(
		String id,
		String email,
		String displayName,
		String avatarUrl,
		OffsetDateTime lastLoginAt,
		String role,
		OffsetDateTime createdAt
	) {}

	public record IdentityRow(
		String id,
		String userId,
		String provider,
		String providerUserId,
		String email,
		String displayName,
		String avatarUrl
	) {}

	private final EntityManager entityManager;

	public AuthSessionRepository(EntityManager entityManager) {
		this.entityManager = entityManager;
	}

	public SessionRow findSessionByTokenHash(String tokenHash) {
		List<?> rows = entityManager.createNativeQuery("""
			select id, user_id, expires_at, last_accessed_at
			from public.auth_sessions
			where session_token_hash = :tokenHash
			limit 1
			""")
			.setParameter("tokenHash", tokenHash)
			.getResultList();
		return rows.isEmpty() ? null : toSessionRow(rows.getFirst());
	}

	public UserRow findUserById(String userId) {
		if (!isUuid(userId)) return null;
		List<?> rows = entityManager.createNativeQuery("""
			select id, email, display_name, avatar_url, last_login_at, role, created_at
			from public.users
			where id = cast(:userId as uuid)
			limit 1
			""")
			.setParameter("userId", userId)
			.getResultList();
		return rows.isEmpty() ? null : toUserRow(rows.getFirst());
	}

	public UserRow findUserByEmail(String email) {
		List<?> rows = entityManager.createNativeQuery("""
			select id, email, display_name, avatar_url, last_login_at, role, created_at
			from public.users
			where email = :email
			limit 1
			""")
			.setParameter("email", email)
			.getResultList();
		return rows.isEmpty() ? null : toUserRow(rows.getFirst());
	}

	public List<UserRow> listUsersForDevLogin() {
		return entityManager.createNativeQuery("""
			select id, email, display_name, avatar_url, last_login_at, role, created_at
			from public.users
			order by last_login_at desc, created_at desc
			""")
			.getResultList()
			.stream()
			.map(this::toUserRow)
			.toList();
	}

	public List<String> listProvidersByUserId(String userId) {
		if (!isUuid(userId)) return List.of();
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

	public List<IdentityRow> listIdentitiesByUserId(String userId) {
		if (!isUuid(userId)) return List.of();
		return entityManager.createNativeQuery("""
			select id, user_id, provider, provider_user_id, email, display_name, avatar_url
			from public.user_identities
			where user_id = cast(:userId as uuid)
			""")
			.setParameter("userId", userId)
			.getResultList()
			.stream()
			.map(this::toIdentityRow)
			.toList();
	}

	public List<IdentityRow> listIdentitiesByUserIds(List<String> userIds) {
		if (userIds.isEmpty()) return List.of();
		return entityManager.createNativeQuery("""
			select id, user_id, provider, provider_user_id, email, display_name, avatar_url
			from public.user_identities
			where user_id = any(string_to_array(:userIds, ',')::uuid[])
			""")
			.setParameter("userIds", String.join(",", userIds))
			.getResultList()
			.stream()
			.map(this::toIdentityRow)
			.toList();
	}

	public IdentityRow findIdentityByProviderUser(String provider, String providerUserId) {
		List<?> rows = entityManager.createNativeQuery("""
			select id, user_id, provider, provider_user_id, email, display_name, avatar_url
			from public.user_identities
			where provider = :provider
			  and provider_user_id = :providerUserId
			limit 1
			""")
			.setParameter("provider", provider)
			.setParameter("providerUserId", providerUserId)
			.getResultList();
		return rows.isEmpty() ? null : toIdentityRow(rows.getFirst());
	}

	public IdentityRow findIdentityByUserProvider(String userId, String provider) {
		if (!isUuid(userId)) return null;
		List<?> rows = entityManager.createNativeQuery("""
			select id, user_id, provider, provider_user_id, email, display_name, avatar_url
			from public.user_identities
			where user_id = cast(:userId as uuid)
			  and provider = :provider
			limit 1
			""")
			.setParameter("userId", userId)
			.setParameter("provider", provider)
			.getResultList();
		return rows.isEmpty() ? null : toIdentityRow(rows.getFirst());
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

	public UserRow insertUser(String userId, String email, String displayName, String avatarUrl, OffsetDateTime now) {
		List<?> rows = entityManager.createNativeQuery("""
			insert into public.users (id, email, display_name, avatar_url, last_login_at, created_at, updated_at)
			values (cast(:userId as uuid), :email, :displayName, :avatarUrl, :lastLoginAt, :createdAt, :updatedAt)
			returning id, email, display_name, avatar_url, last_login_at, role, created_at
			""")
			.setParameter("userId", userId)
			.setParameter("email", email)
			.setParameter("displayName", displayName)
			.setParameter("avatarUrl", avatarUrl)
			.setParameter("lastLoginAt", Timestamp.from(now.toInstant()))
			.setParameter("createdAt", Timestamp.from(now.toInstant()))
			.setParameter("updatedAt", Timestamp.from(now.toInstant()))
			.getResultList();
		return toUserRow(rows.getFirst());
	}

	public UserRow updateUserForLogin(String userId, String email, String displayName, String avatarUrl, OffsetDateTime now) {
		List<?> rows = entityManager.createNativeQuery("""
			update public.users
			set email = coalesce(:email, email),
			    display_name = coalesce(:displayName, display_name),
			    avatar_url = coalesce(:avatarUrl, avatar_url),
			    last_login_at = :lastLoginAt,
			    updated_at = :updatedAt
			where id = cast(:userId as uuid)
			returning id, email, display_name, avatar_url, last_login_at, role, created_at
			""")
			.setParameter("userId", userId)
			.setParameter("email", email)
			.setParameter("displayName", displayName)
			.setParameter("avatarUrl", avatarUrl)
			.setParameter("lastLoginAt", Timestamp.from(now.toInstant()))
			.setParameter("updatedAt", Timestamp.from(now.toInstant()))
			.getResultList();
		return toUserRow(rows.getFirst());
	}

	public void updateIdentity(String identityId, String email, String displayName, String avatarUrl, OffsetDateTime now) {
		entityManager.createNativeQuery("""
			update public.user_identities
			set email = coalesce(:email, email),
			    display_name = coalesce(:displayName, display_name),
			    avatar_url = coalesce(:avatarUrl, avatar_url),
			    last_login_at = :lastLoginAt
			where id = cast(:identityId as uuid)
			""")
			.setParameter("identityId", identityId)
			.setParameter("email", email)
			.setParameter("displayName", displayName)
			.setParameter("avatarUrl", avatarUrl)
			.setParameter("lastLoginAt", Timestamp.from(now.toInstant()))
			.executeUpdate();
	}

	public void insertIdentity(String identityId, String userId, String provider, String providerUserId, String email, String displayName, String avatarUrl, OffsetDateTime now) {
		entityManager.createNativeQuery("""
			insert into public.user_identities (id, user_id, provider, provider_user_id, email, display_name, avatar_url, linked_at, last_login_at)
			values (cast(:identityId as uuid), cast(:userId as uuid), :provider, :providerUserId, :email, :displayName, :avatarUrl, :linkedAt, :lastLoginAt)
			""")
			.setParameter("identityId", identityId)
			.setParameter("userId", userId)
			.setParameter("provider", provider)
			.setParameter("providerUserId", providerUserId)
			.setParameter("email", email)
			.setParameter("displayName", displayName)
			.setParameter("avatarUrl", avatarUrl)
			.setParameter("linkedAt", Timestamp.from(now.toInstant()))
			.setParameter("lastLoginAt", Timestamp.from(now.toInstant()))
			.executeUpdate();
	}

	public void updateUserRole(String userId, String role, OffsetDateTime now) {
		entityManager.createNativeQuery("""
			update public.users
			set role = :role,
			    updated_at = :updatedAt
			where id = cast(:userId as uuid)
			""")
			.setParameter("userId", userId)
			.setParameter("role", role)
			.setParameter("updatedAt", Timestamp.from(now.toInstant()))
			.executeUpdate();
	}

	private SessionRow toSessionRow(Object row) {
		if (!(row instanceof Object[] values) || values.length < 4) {
			throw new IllegalStateException("auth session row를 해석하지 못했습니다.");
		}
		return new SessionRow(asUuidString(values[0]), asUuidString(values[1]), asOffsetDateTime(values[2]), asOffsetDateTime(values[3]));
	}

	private UserRow toUserRow(Object row) {
		if (!(row instanceof Object[] values) || values.length < 7) {
			throw new IllegalStateException("auth user row를 해석하지 못했습니다.");
		}
		return new UserRow(
			asUuidString(values[0]),
			(String) values[1],
			(String) values[2],
			(String) values[3],
			asOffsetDateTime(values[4]),
			(String) values[5],
			asOffsetDateTime(values[6])
		);
	}

	private IdentityRow toIdentityRow(Object row) {
		if (!(row instanceof Object[] values) || values.length < 7) {
			throw new IllegalStateException("auth identity row를 해석하지 못했습니다.");
		}
		return new IdentityRow(
			asUuidString(values[0]),
			asUuidString(values[1]),
			(String) values[2],
			(String) values[3],
			(String) values[4],
			(String) values[5],
			(String) values[6]
		);
	}

	private boolean isUuid(String value) {
		if (value == null || value.isBlank()) return false;
		try {
			UUID.fromString(value.trim());
			return true;
		} catch (IllegalArgumentException error) {
			return false;
		}
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
