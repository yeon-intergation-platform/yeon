package world.yeon.backend.card_decks.merge_guest.repository;

import jakarta.persistence.EntityManager;
import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class MergeGuestCardDeckRepository {
	public record InsertedDeckRow(Long id) {}

	private record NativeQueryRow(Object[] values) {
		static NativeQueryRow of(Object raw) {
			return raw instanceof Object[] values ? new NativeQueryRow(values) : new NativeQueryRow(new Object[]{raw});
		}

		Long longAt(int index) {
			Object value = values[index];
			if (value instanceof Number number) {
				return number.longValue();
			}
			return Long.parseLong(value.toString());
		}
	}

	private final EntityManager entityManager;

	public MergeGuestCardDeckRepository(EntityManager entityManager) {
		this.entityManager = entityManager;
	}

	public InsertedDeckRow insertDeck(
		String publicId,
		UUID userId,
		String title,
		String description,
		OffsetDateTime now
	) {
		List<?> rows = entityManager.createNativeQuery("""
			insert into public.card_decks (public_id, owner_user_id, title, description, created_at, updated_at)
			values (:publicId, :userId, :title, :description, :createdAt, :updatedAt)
			returning id
			""")
			.setParameter("publicId", publicId)
			.setParameter("userId", userId)
			.setParameter("title", title)
			.setParameter("description", description)
			.setParameter("createdAt", Timestamp.from(now.toInstant()))
			.setParameter("updatedAt", Timestamp.from(now.toInstant()))
			.getResultList();
		NativeQueryRow row = NativeQueryRow.of(rows.getFirst());
		return new InsertedDeckRow(row.longAt(0));
	}

	public int insertItems(Long deckId, List<Object[]> rows, OffsetDateTime now) {
		int count = 0;
		for (Object[] row : rows) {
			entityManager.createNativeQuery("""
				insert into public.card_deck_items (
				  public_id, deck_id, front_text, back_text, image_storage_key,
				  review_difficulty, last_reviewed_at, next_review_at, created_at, updated_at
				)
				values (
				  :publicId, :deckId, :frontText, :backText, :imageStorageKey,
				  null, null, null, :createdAt, :updatedAt
				)
				""")
				.setParameter("publicId", row[0])
				.setParameter("deckId", deckId)
				.setParameter("frontText", row[1])
				.setParameter("backText", row[2])
				.setParameter("imageStorageKey", row[3])
				.setParameter("createdAt", Timestamp.from(now.toInstant()))
				.setParameter("updatedAt", Timestamp.from(now.toInstant()))
				.executeUpdate();
			count += 1;
		}
		return count;
	}
}
