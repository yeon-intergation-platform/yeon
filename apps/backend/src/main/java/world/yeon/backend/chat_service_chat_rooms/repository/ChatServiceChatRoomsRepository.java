package world.yeon.backend.chat_service_chat_rooms.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

@Repository
@Profile("jdbc")
public class ChatServiceChatRoomsRepository {
	public record RoomSummaryRow(
		UUID roomId,
		UUID peerId,
		String peerNickname,
		String peerAgeLabel,
		String peerRegionLabel,
		String peerAvatarUrl,
		String peerBio,
		int peerPoints,
		String lastMessagePreview,
		OffsetDateTime lastMessageAt,
		boolean unlockedByPayment
	) {}
	public record RoomParticipantRow(UUID roomId, UUID userAId, UUID userBId) {}
	public record MessageRow(UUID id, UUID roomId, UUID senderId, String body, OffsetDateTime createdAt) {}

	@PersistenceContext
	private EntityManager entityManager;

	public List<RoomSummaryRow> listRoomSummaries(UUID currentProfileId) {
		List<?> rows = entityManager.createNativeQuery("""
			select
				r.id,
				p.id,
				p.nickname,
				p.age_label,
				p.region_label,
				p.avatar_url,
				p.bio,
				p.points,
				m.body,
				m.created_at,
				r.unlocked_by_payment
			from public.chat_service_chat_rooms r
			join public.chat_service_profiles p
			  on p.id = case when r.user_a_id = :currentProfileId then r.user_b_id else r.user_a_id end
			left join lateral (
				select body, created_at
				from public.chat_service_chat_messages
				where room_id = r.id
				order by created_at desc
				limit 1
			) m on true
			where (r.user_a_id = :currentProfileId or r.user_b_id = :currentProfileId)
			  and not exists (
				select 1
				from public.chat_service_blocks b
				where (b.blocker_id = :currentProfileId and b.blocked_id = p.id)
				   or (b.blocker_id = p.id and b.blocked_id = :currentProfileId)
			  )
			order by r.last_message_at desc
		""")
			.setParameter("currentProfileId", currentProfileId)
			.getResultList();
		return rows.stream().map(this::toRoomSummaryRow).toList();
	}

	public RoomParticipantRow findRoomParticipant(UUID roomId) {
		List<?> rows = entityManager.createNativeQuery("""
			select id, user_a_id, user_b_id
			from public.chat_service_chat_rooms
			where id = :roomId
			limit 1
		""")
			.setParameter("roomId", roomId)
			.getResultList();
		if (rows.isEmpty()) return null;
		Object[] v = (Object[]) rows.getFirst();
		return new RoomParticipantRow((UUID) v[0], (UUID) v[1], (UUID) v[2]);
	}

	public RoomSummaryRow findRoomSummary(UUID roomId, UUID currentProfileId) {
		List<?> rows = entityManager.createNativeQuery("""
			select
				r.id,
				p.id,
				p.nickname,
				p.age_label,
				p.region_label,
				p.avatar_url,
				p.bio,
				p.points,
				m.body,
				m.created_at,
				r.unlocked_by_payment
			from public.chat_service_chat_rooms r
			join public.chat_service_profiles p
			  on p.id = case when r.user_a_id = :currentProfileId then r.user_b_id else r.user_a_id end
			left join lateral (
				select body, created_at
				from public.chat_service_chat_messages
				where room_id = r.id
				order by created_at desc
				limit 1
			) m on true
			where r.id = :roomId
			limit 1
		""")
			.setParameter("roomId", roomId)
			.setParameter("currentProfileId", currentProfileId)
			.getResultList();
		if (rows.isEmpty()) return null;
		return toRoomSummaryRow(rows.getFirst());
	}

	public boolean hasBlockedRelation(UUID currentProfileId, UUID targetProfileId) {
		return !entityManager.createNativeQuery("""
			select 1
			from public.chat_service_blocks
			where (blocker_id = :currentProfileId and blocked_id = :targetProfileId)
			   or (blocker_id = :targetProfileId and blocked_id = :currentProfileId)
			limit 1
		""")
			.setParameter("currentProfileId", currentProfileId)
			.setParameter("targetProfileId", targetProfileId)
			.getResultList()
			.isEmpty();
	}

	public List<MessageRow> listMessages(UUID roomId) {
		List<?> rows = entityManager.createNativeQuery("""
			select id, room_id, sender_id, body, created_at
			from public.chat_service_chat_messages
			where room_id = :roomId
			order by created_at asc
		""")
			.setParameter("roomId", roomId)
			.getResultList();
		return rows.stream().map(this::toMessageRow).toList();
	}

	public MessageRow insertMessage(UUID id, UUID roomId, UUID senderId, String body) {
		Object row = entityManager.createNativeQuery("""
			insert into public.chat_service_chat_messages (id, room_id, sender_id, body)
			values (:id, :roomId, :senderId, :body)
			returning id, room_id, sender_id, body, created_at
		""")
			.setParameter("id", id)
			.setParameter("roomId", roomId)
			.setParameter("senderId", senderId)
			.setParameter("body", body)
			.getSingleResult();
		return toMessageRow(row);
	}

	public void updateRoomLastMessageAt(UUID roomId, OffsetDateTime lastMessageAt) {
		entityManager.createNativeQuery("""
			update public.chat_service_chat_rooms
			set last_message_at = :lastMessageAt
			where id = :roomId
		""")
			.setParameter("roomId", roomId)
			.setParameter("lastMessageAt", lastMessageAt)
			.executeUpdate();
	}

	private RoomSummaryRow toRoomSummaryRow(Object row) {
		Object[] v = (Object[]) row;
		return new RoomSummaryRow(
			(UUID) v[0],
			(UUID) v[1],
			(String) v[2],
			(String) v[3],
			(String) v[4],
			(String) v[5],
			(String) v[6],
			((Number) v[7]).intValue(),
			(String) v[8],
			asOffsetDateTime(v[9]),
			(Boolean) v[10]
		);
	}

	private MessageRow toMessageRow(Object row) {
		Object[] v = (Object[]) row;
		return new MessageRow((UUID) v[0], (UUID) v[1], (UUID) v[2], (String) v[3], asOffsetDateTime(v[4]));
	}

	private OffsetDateTime asOffsetDateTime(Object value) {
		if (value == null) return null;
		if (value instanceof OffsetDateTime offsetDateTime) return offsetDateTime;
		if (value instanceof Timestamp timestamp) return timestamp.toInstant().atOffset(ZoneOffset.UTC);
		return OffsetDateTime.parse(String.valueOf(value));
	}
}
