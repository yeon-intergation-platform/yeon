package world.yeon.backend.chat_service_my_profile.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class ChatServiceMyProfileRepository {
	public record ProfileRow(UUID id, String phoneNumber, String nickname, String ageLabel, String regionLabel, String avatarUrl, String bio, int points, boolean notificationsEnabled) {}
	public record SummaryRow(UUID id, String nickname, String ageLabel, String regionLabel, String avatarUrl, String bio, int points) {}
	public record ReportRow(UUID id, String targetType, String targetId, String reason, String status, OffsetDateTime createdAt) {}

	@PersistenceContext
	private EntityManager entityManager;

	public ProfileRow findProfile(UUID profileId) {
		List<?> rows = entityManager.createNativeQuery("""
			select id, phone_number, nickname, age_label, region_label, avatar_url, bio, points, notifications_enabled
			from public.chat_service_profiles
			where id = :profileId
			limit 1
		""")
			.setParameter("profileId", profileId)
			.getResultList();
		if (rows.isEmpty()) return null;
		Object[] v = (Object[]) rows.getFirst();
		return new ProfileRow((UUID) v[0], (String) v[1], (String) v[2], (String) v[3], (String) v[4], (String) v[5], (String) v[6], ((Number) v[7]).intValue(), (Boolean) v[8]);
	}

	public List<SummaryRow> listBlockedProfiles(UUID currentProfileId) {
		List<?> rows = entityManager.createNativeQuery("""
			select p.id, p.nickname, p.age_label, p.region_label, p.avatar_url, p.bio, p.points
			from public.chat_service_blocks b
			join public.chat_service_profiles p on p.id = b.blocked_id
			where b.blocker_id = :currentProfileId
		""")
			.setParameter("currentProfileId", currentProfileId)
			.getResultList();
		return rows.stream().map(row -> {
			Object[] v = (Object[]) row;
			return new SummaryRow((UUID) v[0], (String) v[1], (String) v[2], (String) v[3], (String) v[4], (String) v[5], ((Number) v[6]).intValue());
		}).toList();
	}

	public List<ReportRow> listReports(UUID currentProfileId) {
		List<?> rows = entityManager.createNativeQuery("""
			select id, target_type, target_id, reason, status, created_at
			from public.chat_service_reports
			where reporter_id = :currentProfileId
			order by created_at desc
		""")
			.setParameter("currentProfileId", currentProfileId)
			.getResultList();
		return rows.stream().map(row -> {
			Object[] v = (Object[]) row;
			return new ReportRow((UUID) v[0], (String) v[1], (String) v[2], (String) v[3], (String) v[4], asOffsetDateTime(v[5]));
		}).toList();
	}

	public ProfileRow updateProfile(UUID profileId, String nickname, String ageLabel, String regionLabel, String bio, boolean notificationsEnabled) {
		int updated = entityManager.createNativeQuery("""
			update public.chat_service_profiles
			set nickname = :nickname,
			    age_label = :ageLabel,
			    region_label = :regionLabel,
			    bio = :bio,
			    notifications_enabled = :notificationsEnabled,
			    updated_at = now()
			where id = :profileId
		""")
			.setParameter("profileId", profileId)
			.setParameter("nickname", nickname)
			.setParameter("ageLabel", ageLabel)
			.setParameter("regionLabel", regionLabel)
			.setParameter("bio", bio)
			.setParameter("notificationsEnabled", notificationsEnabled)
			.executeUpdate();
		if (updated == 0) return null;
		return findProfile(profileId);
	}

	public boolean deleteProfile(UUID profileId) {
		return entityManager.createNativeQuery("delete from public.chat_service_profiles where id = :profileId")
			.setParameter("profileId", profileId)
			.executeUpdate() > 0;
	}

	private OffsetDateTime asOffsetDateTime(Object value) {
		if (value == null) return null;
		if (value instanceof OffsetDateTime offsetDateTime) return offsetDateTime;
		if (value instanceof Timestamp timestamp) return timestamp.toInstant().atOffset(ZoneOffset.UTC);
		return OffsetDateTime.parse(String.valueOf(value));
	}
}
