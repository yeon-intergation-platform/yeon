package world.yeon.backend.chat_service_chat_open.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import world.yeon.backend.chat_service_blocks.repository.ChatServiceBlockRelationReader;

@Repository
public class ChatServiceChatOpenRepository {
	public record ChatRoomSummaryRow(
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

	@PersistenceContext
	private EntityManager entityManager;

	@Autowired
	private ChatServiceBlockRelationReader blockRelationReader;

	public boolean hasBlockedRelation(UUID currentProfileId, UUID targetProfileId) {
		// IDX 47: 양방향 차단 조회는 공용 reader 로 위임한다.
		return blockRelationReader.hasBlockedRelation(currentProfileId, targetProfileId);
	}

	public boolean existsProfile(UUID profileId) {
		return !entityManager.createNativeQuery("select 1 from public.chat_service_profiles where id = :profileId limit 1")
			.setParameter("profileId", profileId)
			.getResultList()
			.isEmpty();
	}

	public boolean hasAcceptedFriendLink(UUID currentProfileId, UUID targetProfileId) {
		return !entityManager.createNativeQuery("""
			select 1
			from public.chat_service_friend_links
			where status = 'accepted'
			  and ((requester_id = :currentProfileId and addressee_id = :targetProfileId)
			    or (requester_id = :targetProfileId and addressee_id = :currentProfileId))
			limit 1
		""")
			.setParameter("currentProfileId", currentProfileId)
			.setParameter("targetProfileId", targetProfileId)
			.getResultList()
			.isEmpty();
	}

	public UUID insertRoom(UUID roomId, String roomKey, UUID currentProfileId, UUID targetProfileId, boolean unlockedByPayment) {
		List<?> rows = entityManager.createNativeQuery("""
			insert into public.chat_service_chat_rooms (id, room_key, user_a_id, user_b_id, unlocked_by_payment)
			values (:roomId, :roomKey, :currentProfileId, :targetProfileId, :unlockedByPayment)
			on conflict (room_key) do nothing
			returning id
		""")
			.setParameter("roomId", roomId)
			.setParameter("roomKey", roomKey)
			.setParameter("currentProfileId", currentProfileId)
			.setParameter("targetProfileId", targetProfileId)
			.setParameter("unlockedByPayment", unlockedByPayment)
			.getResultList();
		if (rows.isEmpty()) {
			return null;
		}
		return (UUID) rows.getFirst();
	}

	public boolean deductPoints(UUID profileId, int amount) {
		return entityManager.createNativeQuery("""
			update public.chat_service_profiles
			set points = points - :amount,
			    updated_at = now()
			where id = :profileId
			  and points >= :amount
		""")
			.setParameter("profileId", profileId)
			.setParameter("amount", amount)
			.executeUpdate() > 0;
	}

	public void insertDmUnlock(UUID unlockId, UUID roomId, UUID openerId, UUID targetId, int amount) {
		entityManager.createNativeQuery("""
			insert into public.chat_service_dm_unlocks (id, room_id, opener_id, target_id, amount)
			values (:unlockId, :roomId, :openerId, :targetId, :amount)
		""")
			.setParameter("unlockId", unlockId)
			.setParameter("roomId", roomId)
			.setParameter("openerId", openerId)
			.setParameter("targetId", targetId)
			.setParameter("amount", amount)
			.executeUpdate();
	}

	public ChatRoomSummaryRow findRoomSummaryByRoomKey(String roomKey, UUID currentProfileId) {
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
			where r.room_key = :roomKey
			limit 1
		""")
			.setParameter("roomKey", roomKey)
			.setParameter("currentProfileId", currentProfileId)
			.getResultList();
		if (rows.isEmpty()) {
			return null;
		}
		Object[] v = (Object[]) rows.getFirst();
		return new ChatRoomSummaryRow(
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

	private OffsetDateTime asOffsetDateTime(Object value) {
		if (value == null) return null;
		if (value instanceof OffsetDateTime offsetDateTime) return offsetDateTime;
		if (value instanceof Timestamp timestamp) return timestamp.toInstant().atOffset(ZoneOffset.UTC);
		return OffsetDateTime.parse(String.valueOf(value));
	}
}
