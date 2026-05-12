package world.yeon.backend.chat_service_auth.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class ChatServiceAuthRepository {
	public record ChallengeRow(UUID id, String phoneNumber, String codeHash, OffsetDateTime expiresAt, OffsetDateTime consumedAt) {}
	public record ProfileRow(UUID id, String phoneNumber, String nickname, String ageLabel, String regionLabel, String avatarUrl, String bio, int points) {}
	public record SessionRow(UUID id, UUID profileId, String sessionTokenHash, OffsetDateTime expiresAt) {}

	@PersistenceContext
	private EntityManager entityManager;

	public ChallengeRow insertChallenge(UUID id, String phoneNumber, String codeHash, OffsetDateTime expiresAt) {
		Object row = entityManager.createNativeQuery("""
			insert into public.chat_service_auth_challenges (id, phone_number, code_hash, expires_at)
			values (:id, :phoneNumber, :codeHash, :expiresAt)
			returning id, phone_number, code_hash, expires_at, consumed_at
		""")
			.setParameter("id", id)
			.setParameter("phoneNumber", phoneNumber)
			.setParameter("codeHash", codeHash)
			.setParameter("expiresAt", expiresAt)
			.getSingleResult();
		return toChallengeRow(row);
	}

	public void deleteChallenge(UUID id) {
		entityManager.createNativeQuery("delete from public.chat_service_auth_challenges where id = :id").setParameter("id", id).executeUpdate();
	}

	public ChallengeRow findChallenge(UUID id) {
		List<?> rows = entityManager.createNativeQuery("select id, phone_number, code_hash, expires_at, consumed_at from public.chat_service_auth_challenges where id = :id limit 1")
			.setParameter("id", id)
			.getResultList();
		if (rows.isEmpty()) return null;
		return toChallengeRow(rows.getFirst());
	}

	public void consumeChallenge(UUID id) {
		entityManager.createNativeQuery("update public.chat_service_auth_challenges set consumed_at = now() where id = :id")
			.setParameter("id", id)
			.executeUpdate();
	}

	public ProfileRow findProfileByPhone(String phoneNumber) {
		List<?> rows = entityManager.createNativeQuery("select id, phone_number, nickname, age_label, region_label, avatar_url, bio, points from public.chat_service_profiles where phone_number = :phoneNumber limit 1")
			.setParameter("phoneNumber", phoneNumber)
			.getResultList();
		if (rows.isEmpty()) return null;
		return toProfileRow(rows.getFirst());
	}

	public ProfileRow createProfile(UUID id, String phoneNumber, String nickname) {
		Object row = entityManager.createNativeQuery("""
			insert into public.chat_service_profiles (id, phone_number, nickname, age_label, region_label, bio, points)
			values (:id, :phoneNumber, :nickname, '20살', '서울', '', 1000)
			returning id, phone_number, nickname, age_label, region_label, avatar_url, bio, points
		""")
			.setParameter("id", id)
			.setParameter("phoneNumber", phoneNumber)
			.setParameter("nickname", nickname)
			.getSingleResult();
		return toProfileRow(row);
	}

	public SessionRow insertSession(UUID id, UUID profileId, String sessionTokenHash, OffsetDateTime expiresAt) {
		Object row = entityManager.createNativeQuery("""
			insert into public.chat_service_auth_sessions (id, profile_id, session_token_hash, expires_at)
			values (:id, :profileId, :sessionTokenHash, :expiresAt)
			returning id, profile_id, session_token_hash, expires_at
		""")
			.setParameter("id", id)
			.setParameter("profileId", profileId)
			.setParameter("sessionTokenHash", sessionTokenHash)
			.setParameter("expiresAt", expiresAt)
			.getSingleResult();
		return toSessionRow(row);
	}

	public SessionRow findSessionByHash(String sessionTokenHash) {
		List<?> rows = entityManager.createNativeQuery("select id, profile_id, session_token_hash, expires_at from public.chat_service_auth_sessions where session_token_hash = :sessionTokenHash limit 1")
			.setParameter("sessionTokenHash", sessionTokenHash)
			.getResultList();
		if (rows.isEmpty()) return null;
		return toSessionRow(rows.getFirst());
	}

	public void deleteSession(UUID id) {
		entityManager.createNativeQuery("delete from public.chat_service_auth_sessions where id = :id").setParameter("id", id).executeUpdate();
	}

	public void deleteSessionByHash(String sessionTokenHash) {
		entityManager.createNativeQuery("delete from public.chat_service_auth_sessions where session_token_hash = :sessionTokenHash")
			.setParameter("sessionTokenHash", sessionTokenHash)
			.executeUpdate();
	}

	public void touchSession(UUID id) {
		entityManager.createNativeQuery("update public.chat_service_auth_sessions set last_accessed_at = now() where id = :id").setParameter("id", id).executeUpdate();
	}

	public ProfileRow findProfileById(UUID profileId) {
		List<?> rows = entityManager.createNativeQuery("select id, phone_number, nickname, age_label, region_label, avatar_url, bio, points from public.chat_service_profiles where id = :profileId limit 1")
			.setParameter("profileId", profileId)
			.getResultList();
		if (rows.isEmpty()) return null;
		return toProfileRow(rows.getFirst());
	}

	private ChallengeRow toChallengeRow(Object row) {
		Object[] v=(Object[])row;
		return new ChallengeRow((UUID)v[0], (String)v[1], (String)v[2], asOffsetDateTime(v[3]), asOffsetDateTime(v[4]));
	}
	private ProfileRow toProfileRow(Object row) {
		Object[] v=(Object[])row;
		return new ProfileRow((UUID)v[0], (String)v[1], (String)v[2], (String)v[3], (String)v[4], (String)v[5], (String)v[6], ((Number)v[7]).intValue());
	}
	private SessionRow toSessionRow(Object row) {
		Object[] v=(Object[])row;
		return new SessionRow((UUID)v[0], (UUID)v[1], (String)v[2], asOffsetDateTime(v[3]));
	}
	private OffsetDateTime asOffsetDateTime(Object value) {
		if (value == null) return null;
		if (value instanceof OffsetDateTime o) return o;
		if (value instanceof Timestamp t) return t.toInstant().atOffset(ZoneOffset.UTC);
		return OffsetDateTime.parse(String.valueOf(value));
	}
}
