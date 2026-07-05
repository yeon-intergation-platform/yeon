package world.yeon.backend.users.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceException;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class UserRepository {
	private static final String USER_SELECT_COLUMNS = """
		u.id,
		u.email,
		u.display_name,
		u.role,
		u.last_login_at,
		u.created_at,
		u.updated_at,
		u.email_verified_at,
		(select count(*)::int from public.auth_sessions s where s.user_id = u.id) as session_count,
		coalesce((select string_agg(distinct i.provider, ',' order by i.provider) from public.user_identities i where i.user_id = u.id), '') as identity_provider_csv,
		(select count(*)::int from public.card_decks cd where cd.owner_user_id = u.id) as card_deck_count,
		(select count(*)::int from public.typing_decks td where td.owner_user_id = u.id) as typing_deck_count
		""";

	public record UserRow(
		String id,
		String email,
		String displayName,
		String role,
		OffsetDateTime lastLoginAt,
		OffsetDateTime createdAt,
		OffsetDateTime updatedAt,
		OffsetDateTime emailVerifiedAt,
		int sessionCount,
		List<String> identityProviders,
		int cardDeckCount,
		int typingDeckCount
	) {}

	private final EntityManager entityManager;

	public UserRepository(EntityManager entityManager) {
		this.entityManager = entityManager;
	}

	public List<UserRow> listUsers() {
		return entityManager.createNativeQuery(
				"select " + USER_SELECT_COLUMNS + """
				from public.users u
				order by u.created_at desc
				""")
			.getResultList()
			.stream()
			.map(this::toUserRow)
			.toList();
	}

	public UserRow findById(UUID userId) {
		List<?> rows = entityManager.createNativeQuery(
				"select " + USER_SELECT_COLUMNS + """
				from public.users u
				where u.id = :userId
				limit 1
				""")
			.setParameter("userId", userId)
			.getResultList();
		return rows.isEmpty() ? null : toUserRow(rows.getFirst());
	}

	public UserRow findByEmail(String email) {
		List<?> rows = entityManager.createNativeQuery(
				"select " + USER_SELECT_COLUMNS + """
				from public.users u
				where u.email = :email
				limit 1
				""")
			.setParameter("email", email)
			.getResultList();
		return rows.isEmpty() ? null : toUserRow(rows.getFirst());
	}

	@Transactional
	public UserRow insertUser(String userId, String email, String displayName, OffsetDateTime now) {
		try {
			List<?> rows = entityManager.createNativeQuery("""
				insert into public.users (id, email, display_name, created_at, updated_at)
				values (cast(:userId as uuid), :email, :displayName, :createdAt, :updatedAt)
				returning id
				""")
				.setParameter("userId", userId)
				.setParameter("email", email)
				.setParameter("displayName", displayName)
				.setParameter("createdAt", Timestamp.from(now.toInstant()))
				.setParameter("updatedAt", Timestamp.from(now.toInstant()))
				.getResultList();
			return rows.isEmpty() ? null : findById(UUID.fromString(asUuidString(rows.getFirst())));
		} catch (PersistenceException error) {
			throw error;
		}
	}

	@Transactional
	public UserRow updateDisplayName(UUID userId, String displayName, OffsetDateTime now) {
		List<?> rows = entityManager.createNativeQuery("""
			update public.users
			set display_name = :displayName,
			    updated_at = :updatedAt
			where id = :userId
			returning id
			""")
			.setParameter("userId", userId)
			.setParameter("displayName", displayName)
			.setParameter("updatedAt", Timestamp.from(now.toInstant()))
			.getResultList();
		return rows.isEmpty() ? null : findById(UUID.fromString(asUuidString(rows.getFirst())));
	}

	@Transactional
	public UserRow updateRole(UUID userId, String role, OffsetDateTime now) {
		List<?> rows = entityManager.createNativeQuery("""
			update public.users
			set role = :role,
			    updated_at = :updatedAt
			where id = :userId
			returning id
			""")
			.setParameter("userId", userId)
			.setParameter("role", role)
			.setParameter("updatedAt", Timestamp.from(now.toInstant()))
			.getResultList();
		return rows.isEmpty() ? null : findById(UUID.fromString(asUuidString(rows.getFirst())));
	}

	@Transactional
	public int deleteSessionsByUserId(UUID userId) {
		return entityManager.createNativeQuery("""
			delete from public.auth_sessions
			where user_id = :userId
			""")
			.setParameter("userId", userId)
			.executeUpdate();
	}

	@Transactional
	public int deleteUser(UUID userId) {
		return entityManager.createNativeQuery("""
			delete from public.users
			where id = :userId
			""")
			.setParameter("userId", userId)
			.executeUpdate();
	}

	private UserRow toUserRow(Object row) {
		if (!(row instanceof Object[] values) || values.length < 12) {
			throw new IllegalStateException("user row를 해석하지 못했습니다.");
		}
		return new UserRow(
			asUuidString(values[0]),
			(String) values[1],
			(String) values[2],
			(String) values[3],
			asOffsetDateTime(values[4]),
			asOffsetDateTime(values[5]),
			asOffsetDateTime(values[6]),
			asOffsetDateTime(values[7]),
			asInt(values[8]),
			asCsvList(values[9]),
			asInt(values[10]),
			asInt(values[11])
		);
	}

	private String asUuidString(Object value) {
		if (value == null) return null;
		if (value instanceof UUID uuid) return uuid.toString();
		return value.toString();
	}

	private int asInt(Object value) {
		if (value == null) return 0;
		if (value instanceof Number number) return number.intValue();
		return Integer.parseInt(value.toString());
	}

	private List<String> asCsvList(Object value) {
		if (value == null) return List.of();
		String text = value.toString().trim();
		if (text.isBlank()) return List.of();
		return Arrays.stream(text.split(","))
			.map(String::trim)
			.filter(item -> !item.isBlank())
			.toList();
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
