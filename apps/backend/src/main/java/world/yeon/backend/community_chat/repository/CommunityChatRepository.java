package world.yeon.backend.community_chat.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class CommunityChatRepository {
	public record MessageRow(UUID id, UUID senderUserId, String guestSessionId, String senderNickname, String body, OffsetDateTime createdAt) {}

	@PersistenceContext
	private EntityManager entityManager;

	public List<MessageRow> listLatest(int limit) {
		List<?> rows = entityManager.createNativeQuery("""
			select id, sender_user_id, guest_session_id, sender_nickname, body, created_at
			from (
				select id, sender_user_id, guest_session_id, sender_nickname, body, created_at
				from public.community_chat_messages
				order by created_at desc
				limit :limit
			) latest
			order by created_at asc
		""")
			.setParameter("limit", limit)
			.getResultList();
		return rows.stream().map(this::toMessageRow).toList();
	}

	public MessageRow insert(UUID id, UUID senderUserId, String guestSessionId, String senderNickname, String body) {
		Object row = senderUserId != null
			? entityManager.createNativeQuery("""
				insert into public.community_chat_messages (id, sender_user_id, sender_nickname, body)
				values (:id, :senderUserId, :senderNickname, :body)
				returning id, sender_user_id, guest_session_id, sender_nickname, body, created_at
			""")
				.setParameter("id", id)
				.setParameter("senderUserId", senderUserId)
				.setParameter("senderNickname", senderNickname)
				.setParameter("body", body)
				.getSingleResult()
			: entityManager.createNativeQuery("""
				insert into public.community_chat_messages (id, guest_session_id, sender_nickname, body)
				values (:id, :guestSessionId, :senderNickname, :body)
				returning id, sender_user_id, guest_session_id, sender_nickname, body, created_at
			""")
				.setParameter("id", id)
				.setParameter("guestSessionId", guestSessionId)
				.setParameter("senderNickname", senderNickname)
				.setParameter("body", body)
				.getSingleResult();
		return toMessageRow(row);
	}

	private MessageRow toMessageRow(Object row) {
		Object[] v = (Object[]) row;
		return new MessageRow((UUID) v[0], (UUID) v[1], (String) v[2], (String) v[3], (String) v[4], asOffsetDateTime(v[5]));
	}

	private OffsetDateTime asOffsetDateTime(Object value) {
		if (value == null) return null;
		if (value instanceof OffsetDateTime offsetDateTime) return offsetDateTime;
		if (value instanceof Timestamp timestamp) return timestamp.toInstant().atOffset(ZoneOffset.UTC);
		return OffsetDateTime.parse(String.valueOf(value));
	}
}
