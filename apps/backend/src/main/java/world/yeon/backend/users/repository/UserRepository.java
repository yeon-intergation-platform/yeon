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
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class UserRepository {

	public record UserRow(
		String id,
		String email,
		String displayName,
		String role,
		OffsetDateTime lastLoginAt,
		OffsetDateTime createdAt,
		OffsetDateTime updatedAt
	) {}

	private final EntityManager entityManager;

	public UserRepository(EntityManager entityManager) {
		this.entityManager = entityManager;
	}

	public List<UserRow> listUsers() {
		return entityManager.createNativeQuery("""
			select id, email, display_name, role, last_login_at, created_at, updated_at
			from public.users
			order by created_at desc
			""")
			.getResultList()
			.stream()
			.map(this::toUserRow)
			.toList();
	}

	public UserRow findById(UUID userId) {
		List<?> rows = entityManager.createNativeQuery("""
			select id, email, display_name, role, last_login_at, created_at, updated_at
			from public.users
			where id = :userId
			limit 1
			""")
			.setParameter("userId", userId)
			.getResultList();
		return rows.isEmpty() ? null : toUserRow(rows.getFirst());
	}

	public UserRow findByEmail(String email) {
		List<?> rows = entityManager.createNativeQuery("""
			select id, email, display_name, role, last_login_at, created_at, updated_at
			from public.users
			where email = :email
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
				returning id, email, display_name, role, last_login_at, created_at, updated_at
				""")
				.setParameter("userId", userId)
				.setParameter("email", email)
				.setParameter("displayName", displayName)
				.setParameter("createdAt", Timestamp.from(now.toInstant()))
				.setParameter("updatedAt", Timestamp.from(now.toInstant()))
				.getResultList();
			return rows.isEmpty() ? null : toUserRow(rows.getFirst());
		} catch (PersistenceException error) {
			throw error;
		}
	}

	private UserRow toUserRow(Object row) {
		if (!(row instanceof Object[] values) || values.length < 7) {
			throw new IllegalStateException("user row를 해석하지 못했습니다.");
		}
		return new UserRow(
			asUuidString(values[0]),
			(String) values[1],
			(String) values[2],
			(String) values[3],
			asOffsetDateTime(values[4]),
			asOffsetDateTime(values[5]),
			asOffsetDateTime(values[6])
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
