package world.yeon.backend.community_chat.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.function.Function;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class CommunityChatRepository {
	public record MessageRow(UUID id, UUID senderUserId, String guestSessionId, String senderNickname, String body, OffsetDateTime createdAt) {}


	private record NativeQueryRow(Object[] values, String label) {
		static NativeQueryRow require(Object raw, int min, String label) {
			Object[] values = raw instanceof Object[] rowValues ? rowValues : new Object[]{raw};
			if (values.length < min) {
				throw new IllegalStateException(label + "를 해석하지 못했습니다. 필요한 컬럼: " + min + ", 실제 컬럼: " + values.length);
			}
			return new NativeQueryRow(values, label);
		}

		Object valueAt(int index) {
			if (index >= values.length) {
				throw new IllegalStateException(label + "의 " + index + "번째 컬럼을 읽을 수 없습니다.");
			}
			return values[index];
		}
	}

	private record NativeTimeValueReader<T>(Class<T> type, Function<T, OffsetDateTime> mapper) {
		OffsetDateTime readIfSupported(Object value) {
			return type.isInstance(value) ? mapper.apply(type.cast(value)) : null;
		}
	}

	private static final List<NativeTimeValueReader<?>> NATIVE_TIME_VALUE_READERS = List.of(
		new NativeTimeValueReader<>(OffsetDateTime.class, Function.identity()),
		new NativeTimeValueReader<>(Timestamp.class, value -> value.toInstant().atOffset(ZoneOffset.UTC))
	);

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
		NativeQueryRow values = NativeQueryRow.require(row, 6, "community chat message row");
		return new MessageRow(
			(UUID) values.valueAt(0),
			(UUID) values.valueAt(1),
			(String) values.valueAt(2),
			(String) values.valueAt(3),
			(String) values.valueAt(4),
			asOffsetDateTime(values.valueAt(5))
		);
	}

	private OffsetDateTime asOffsetDateTime(Object value) {
		if (value == null) return null;
		for (NativeTimeValueReader<?> reader : NATIVE_TIME_VALUE_READERS) {
			OffsetDateTime converted = reader.readIfSupported(value);
			if (converted != null) {
				return converted;
			}
		}
		return OffsetDateTime.parse(String.valueOf(value));
	}
}
