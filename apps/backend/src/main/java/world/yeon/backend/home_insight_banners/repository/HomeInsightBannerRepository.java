package world.yeon.backend.home_insight_banners.repository;

import jakarta.persistence.EntityManager;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class HomeInsightBannerRepository {
	public record DismissalRow(String bannerKey, OffsetDateTime hiddenUntil) {}
	private final EntityManager entityManager;
	public HomeInsightBannerRepository(EntityManager entityManager) { this.entityManager = entityManager; }
	public List<DismissalRow> findDismissals(UUID userId) {
		return entityManager.createNativeQuery("""
			select banner_key, hidden_until
			from public.home_insight_banner_dismissals
			where user_id = :userId
			""")
			.setParameter("userId", userId)
			.getResultList().stream().map(this::toRow).toList();
	}
	@Transactional
	public void upsertDismissal(String publicId, UUID userId, String bannerKey, OffsetDateTime hiddenUntil, OffsetDateTime updatedAt) {
		entityManager.createNativeQuery("""
			insert into public.home_insight_banner_dismissals (public_id, user_id, banner_key, hidden_until, updated_at, created_at)
			values (:publicId, :userId, :bannerKey, :hiddenUntil, :updatedAt, :updatedAt)
			on conflict (user_id, banner_key) do update set
			  hidden_until = excluded.hidden_until,
			  updated_at = excluded.updated_at
			""")
			.setParameter("publicId", publicId)
			.setParameter("userId", userId)
			.setParameter("bannerKey", bannerKey)
			.setParameter("hiddenUntil", Timestamp.from(hiddenUntil.toInstant()))
			.setParameter("updatedAt", Timestamp.from(updatedAt.toInstant()))
			.executeUpdate();
	}
	private DismissalRow toRow(Object row) {
		Object[] values = (Object[]) row;
		return new DismissalRow((String) values[0], asOffsetDateTime(values[1]));
	}
	private OffsetDateTime asOffsetDateTime(Object value) { if (value == null) return null; if (value instanceof OffsetDateTime o) return o; if (value instanceof Timestamp t) return t.toInstant().atOffset(java.time.ZoneOffset.UTC); if (value instanceof Instant i) return i.atOffset(java.time.ZoneOffset.UTC); if (value instanceof java.util.Date d) return d.toInstant().atOffset(java.time.ZoneOffset.UTC); if (value instanceof LocalDateTime l) return l.atOffset(java.time.ZoneOffset.UTC); if (value instanceof ZonedDateTime z) return z.toOffsetDateTime(); return OffsetDateTime.parse(value.toString()); }
}
