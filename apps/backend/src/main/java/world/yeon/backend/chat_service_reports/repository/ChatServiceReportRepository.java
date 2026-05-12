package world.yeon.backend.chat_service_reports.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class ChatServiceReportRepository {
	public record MessageRoomRow(UUID roomId, UUID userAId, UUID userBId) {}
	public record ReportRow(UUID id, String targetType, String targetId, String reason, String status, OffsetDateTime createdAt) {}

	@PersistenceContext
	private EntityManager entityManager;

	public boolean existsFeedPost(String id) { return existsById("public.chat_service_feed_posts", id); }
	public boolean existsAskPost(String id) { return existsById("public.chat_service_ask_posts", id); }
	public boolean existsProfile(UUID id) { return !entityManager.createNativeQuery("select 1 from public.chat_service_profiles where id = :id limit 1").setParameter("id", id).getResultList().isEmpty(); }
	public MessageRoomRow findMessageRoom(String messageId) {
		List<?> rows = entityManager.createNativeQuery("""
			select r.id, r.user_a_id, r.user_b_id
			from public.chat_service_chat_messages m
			join public.chat_service_chat_rooms r on r.id = m.room_id
			where m.id = :messageId
			limit 1
		""")
			.setParameter("messageId", messageId)
			.getResultList();
		if (rows.isEmpty()) return null;
		Object[] v = (Object[]) rows.getFirst();
		return new MessageRoomRow((UUID) v[0], (UUID) v[1], (UUID) v[2]);
	}

	public ReportRow insertReport(UUID id, UUID reporterId, String targetType, String targetId, String reason) {
		Object row = entityManager.createNativeQuery("""
			insert into public.chat_service_reports (id, reporter_id, target_type, target_id, reason, status)
			values (:id, :reporterId, :targetType, :targetId, :reason, 'received')
			returning id, target_type, target_id, reason, status, created_at
		""")
			.setParameter("id", id)
			.setParameter("reporterId", reporterId)
			.setParameter("targetType", targetType)
			.setParameter("targetId", targetId)
			.setParameter("reason", reason)
			.getSingleResult();
		Object[] v = (Object[]) row;
		return new ReportRow((UUID) v[0], (String) v[1], (String) v[2], (String) v[3], (String) v[4], asOffsetDateTime(v[5]));
	}

	private boolean existsById(String tableName, String id) {
		return !entityManager.createNativeQuery("select 1 from " + tableName + " where id = :id limit 1")
			.setParameter("id", id)
			.getResultList()
			.isEmpty();
	}

	private OffsetDateTime asOffsetDateTime(Object value) {
		if (value == null) return null;
		if (value instanceof OffsetDateTime offsetDateTime) return offsetDateTime;
		if (value instanceof Timestamp timestamp) return timestamp.toInstant().atOffset(ZoneOffset.UTC);
		return OffsetDateTime.parse(String.valueOf(value));
	}
}
