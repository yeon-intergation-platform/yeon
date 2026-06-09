package world.yeon.backend.card_decks.route.repository;

import jakarta.persistence.EntityManager;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.List;
import java.util.function.Function;
import java.util.UUID;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class CardDeckRouteRepository {
	public record CardDeckRow(Long internalId, String publicId, String ownerUserId, String title, String description, OffsetDateTime createdAt, OffsetDateTime updatedAt) {}
	public record CardDeckListRow(Long internalId, String publicId, String ownerUserId, String title, String description, OffsetDateTime createdAt, OffsetDateTime updatedAt, int itemCount) {}
	public record CardDeckItemRow(Long internalId, String publicId, Long deckId, String frontText, String backText, String imageStorageKey, String reviewDifficulty, OffsetDateTime lastReviewedAt, OffsetDateTime nextReviewAt, OffsetDateTime createdAt, OffsetDateTime updatedAt) {}

	private record NativeQueryRow(Object[] values, String label) {
		static NativeQueryRow require(Object raw, int min, String label) {
			Object[] values = raw instanceof Object[] rowValues ? rowValues : new Object[]{raw};
			if (values.length < min) {
				throw new IllegalStateException(label + "를 해석하지 못했습니다. 필요한 컬럼: " + min + ", 실제 컬럼: " + values.length);
			}
			return new NativeQueryRow(values, label);
		}

		NativeQueryValue valueAt(int index) {
			if (index >= values.length) {
				throw new IllegalStateException(label + "의 " + index + "번째 컬럼을 읽을 수 없습니다.");
			}
			return new NativeQueryValue(values[index], label + "[" + index + "]");
		}
	}


	private record NativeTimeValueReader<T>(Class<T> type, Function<T, OffsetDateTime> mapper) {
		OffsetDateTime readIfSupported(Object value) {
			return type.isInstance(value) ? mapper.apply(type.cast(value)) : null;
		}
	}

	private static final List<NativeTimeValueReader<?>> NATIVE_TIME_VALUE_READERS = List.of(
		new NativeTimeValueReader<>(OffsetDateTime.class, Function.identity()),
		new NativeTimeValueReader<>(Timestamp.class, value -> value.toInstant().atOffset(ZoneOffset.UTC)),
		new NativeTimeValueReader<>(Instant.class, value -> value.atOffset(ZoneOffset.UTC)),
		new NativeTimeValueReader<>(Date.class, value -> value.toInstant().atOffset(ZoneOffset.UTC)),
		new NativeTimeValueReader<>(ZonedDateTime.class, ZonedDateTime::toOffsetDateTime)
	);

	private record NativeQueryValue(Object value, String label) {
		String asString() {
			return value == null ? null : value.toString();
		}

		Long asLong() {
			if (value instanceof Number number) {
				return number.longValue();
			}
			return Long.parseLong(requiredText());
		}

		int asInt() {
			if (value instanceof Number number) {
				return number.intValue();
			}
			return Integer.parseInt(requiredText());
		}

		OffsetDateTime asOffsetDateTime() {
			if (value == null) {
				return null;
			}
			for (NativeTimeValueReader<?> reader : NATIVE_TIME_VALUE_READERS) {
				OffsetDateTime converted = reader.readIfSupported(value);
				if (converted != null) {
					return converted;
				}
			}
			return OffsetDateTime.parse(requiredText());
		}

		private String requiredText() {
			if (value == null) {
				throw new IllegalStateException(label + " 값이 비어 있습니다.");
			}
			return value.toString();
		}
	}

	private final EntityManager entityManager;

	public CardDeckRouteRepository(EntityManager entityManager) {
		this.entityManager = entityManager;
	}

	public List<CardDeckListRow> listDecks(UUID userId) {
		return entityManager.createNativeQuery("""
			select d.id, d.public_id, d.owner_user_id, d.title, d.description, d.created_at, d.updated_at,
			       count(i.id)::int as item_count
			from public.card_decks d
			left join public.card_deck_items i on i.deck_id = d.id
			where d.owner_user_id = :userId
			group by d.id
			order by d.created_at desc
		""")
			.setParameter("userId", userId)
			.getResultList()
			.stream()
			.map(this::toDeckListRow)
			.toList();
	}

	public CardDeckRow findOwnedDeck(UUID userId, String deckPublicId) {
		List<?> rows = entityManager.createNativeQuery("""
			select id, public_id, owner_user_id, title, description, created_at, updated_at
			from public.card_decks
			where public_id = :deckPublicId and owner_user_id = :userId
			limit 1
		""")
			.setParameter("deckPublicId", deckPublicId)
			.setParameter("userId", userId)
			.getResultList();
		return rows.isEmpty() ? null : toDeckRow(rows.getFirst());
	}

	public List<CardDeckItemRow> listDeckItems(Long deckId) {
		return entityManager.createNativeQuery("""
			select id, public_id, deck_id, front_text, back_text, image_storage_key, review_difficulty, last_reviewed_at, next_review_at, created_at, updated_at
			from public.card_deck_items
			where deck_id = :deckId
			order by case when next_review_at is null then 0 when next_review_at <= now() then 0 else 1 end,
			         next_review_at asc,
			         created_at asc
		""")
			.setParameter("deckId", deckId)
			.getResultList()
			.stream()
			.map(this::toItemRow)
			.toList();
	}

	public CardDeckItemRow findOwnedItem(UUID userId, String deckPublicId, String itemPublicId) {
		List<?> rows = entityManager.createNativeQuery("""
			select i.id, i.public_id, i.deck_id, i.front_text, i.back_text, i.image_storage_key, i.review_difficulty, i.last_reviewed_at, i.next_review_at, i.created_at, i.updated_at
			from public.card_deck_items i
			join public.card_decks d on d.id = i.deck_id
			where d.owner_user_id = :userId and d.public_id = :deckPublicId and i.public_id = :itemPublicId
			limit 1
		""")
			.setParameter("userId", userId)
			.setParameter("deckPublicId", deckPublicId)
			.setParameter("itemPublicId", itemPublicId)
			.getResultList();
		return rows.isEmpty() ? null : toItemRow(rows.getFirst());
	}

	public int countItems(Long deckId) {
		Object value = entityManager.createNativeQuery("select count(id)::int from public.card_deck_items where deck_id = :deckId")
			.setParameter("deckId", deckId)
			.getSingleResult();
		return asInt(value);
	}

	public String findUserCardStudyMode(UUID userId) {
		List<?> rows = entityManager.createNativeQuery("select card_study_mode from public.users where id = :userId limit 1")
			.setParameter("userId", userId)
			.getResultList();
		if (rows.isEmpty()) return null;
		return scalarValue(rows.getFirst(), "user card study mode").asString();
	}

	@Transactional
	public CardDeckRow insertDeck(String publicId, UUID userId, String title, String description, OffsetDateTime now) {
		List<?> rows = entityManager.createNativeQuery("""
			insert into public.card_decks (public_id, owner_user_id, title, description, created_at, updated_at)
			values (:publicId, :userId, :title, :description, :createdAt, :updatedAt)
			returning id, public_id, owner_user_id, title, description, created_at, updated_at
		""")
			.setParameter("publicId", publicId)
			.setParameter("userId", userId)
			.setParameter("title", title)
			.setParameter("description", description)
			.setParameter("createdAt", Timestamp.from(now.toInstant()))
			.setParameter("updatedAt", Timestamp.from(now.toInstant()))
			.getResultList();
		return rows.isEmpty() ? null : toDeckRow(rows.getFirst());
	}

	@Transactional
	public CardDeckRow updateDeck(Long deckId, String title, String description, OffsetDateTime now) {
		List<?> rows = entityManager.createNativeQuery("""
			update public.card_decks
			set title = :title,
			    description = :description,
			    updated_at = :updatedAt
			where id = :deckId
			returning id, public_id, owner_user_id, title, description, created_at, updated_at
		""")
			.setParameter("deckId", deckId)
			.setParameter("title", title)
			.setParameter("description", description)
			.setParameter("updatedAt", Timestamp.from(now.toInstant()))
			.getResultList();
		return rows.isEmpty() ? null : toDeckRow(rows.getFirst());
	}

	@Transactional
	public boolean deleteDeck(Long deckId) {
		return entityManager.createNativeQuery("delete from public.card_decks where id = :deckId")
			.setParameter("deckId", deckId)
			.executeUpdate() > 0;
	}

	@Transactional
	public CardDeckItemRow insertItem(String publicId, Long deckId, String frontText, String backText, String imageStorageKey, OffsetDateTime now) {
		List<?> rows = entityManager.createNativeQuery("""
			insert into public.card_deck_items (public_id, deck_id, front_text, back_text, image_storage_key, created_at, updated_at)
			values (:publicId, :deckId, :frontText, :backText, :imageStorageKey, :createdAt, :updatedAt)
			returning id, public_id, deck_id, front_text, back_text, image_storage_key, review_difficulty, last_reviewed_at, next_review_at, created_at, updated_at
		""")
			.setParameter("publicId", publicId)
			.setParameter("deckId", deckId)
			.setParameter("frontText", frontText)
			.setParameter("backText", backText)
			.setParameter("imageStorageKey", imageStorageKey)
			.setParameter("createdAt", Timestamp.from(now.toInstant()))
			.setParameter("updatedAt", Timestamp.from(now.toInstant()))
			.getResultList();
		return rows.isEmpty() ? null : toItemRow(rows.getFirst());
	}

	@Transactional
	public CardDeckItemRow updateItem(Long itemId, String frontText, String backText, boolean updateImageStorageKey, String imageStorageKey, OffsetDateTime now) {
		String imageAssignment = updateImageStorageKey ? "    image_storage_key = :imageStorageKey,\n" : "";
		var query = entityManager.createNativeQuery("""
			update public.card_deck_items
			set front_text = :frontText,
			    back_text = :backText,
			""" + imageAssignment + """
			    updated_at = :updatedAt
			where id = :itemId
			returning id, public_id, deck_id, front_text, back_text, image_storage_key, review_difficulty, last_reviewed_at, next_review_at, created_at, updated_at
		""")
			.setParameter("itemId", itemId)
			.setParameter("frontText", frontText)
			.setParameter("backText", backText)
			.setParameter("updatedAt", Timestamp.from(now.toInstant()));
		if (updateImageStorageKey) {
			query.setParameter("imageStorageKey", imageStorageKey);
		}
		List<?> rows = query.getResultList();
		return rows.isEmpty() ? null : toItemRow(rows.getFirst());
	}

	@Transactional
	public CardDeckItemRow reviewItem(Long itemId, String difficulty, OffsetDateTime lastReviewedAt, OffsetDateTime nextReviewAt) {
		List<?> rows = entityManager.createNativeQuery("""
			update public.card_deck_items
			set review_difficulty = :difficulty,
			    last_reviewed_at = :lastReviewedAt,
			    next_review_at = :nextReviewAt,
			    updated_at = :updatedAt
			where id = :itemId
			returning id, public_id, deck_id, front_text, back_text, image_storage_key, review_difficulty, last_reviewed_at, next_review_at, created_at, updated_at
		""")
			.setParameter("itemId", itemId)
			.setParameter("difficulty", difficulty)
			.setParameter("lastReviewedAt", Timestamp.from(lastReviewedAt.toInstant()))
			.setParameter("nextReviewAt", Timestamp.from(nextReviewAt.toInstant()))
			.setParameter("updatedAt", Timestamp.from(lastReviewedAt.toInstant()))
			.getResultList();
		return rows.isEmpty() ? null : toItemRow(rows.getFirst());
	}

	@Transactional
	public boolean deleteItem(Long itemId) {
		return entityManager.createNativeQuery("delete from public.card_deck_items where id = :itemId")
			.setParameter("itemId", itemId)
			.executeUpdate() > 0;
	}

	@Transactional
	public void touchDeck(Long deckId, OffsetDateTime now) {
		entityManager.createNativeQuery("update public.card_decks set updated_at = :updatedAt where id = :deckId")
			.setParameter("deckId", deckId)
			.setParameter("updatedAt", Timestamp.from(now.toInstant()))
			.executeUpdate();
	}

	@Transactional
	public String updateUserCardStudyMode(UUID userId, String studyMode, OffsetDateTime now) {
		List<?> rows = entityManager.createNativeQuery("""
			update public.users
			set card_study_mode = :studyMode,
			    updated_at = :updatedAt
			where id = :userId
			returning card_study_mode
		""")
			.setParameter("userId", userId)
			.setParameter("studyMode", studyMode)
			.setParameter("updatedAt", Timestamp.from(now.toInstant()))
			.getResultList();
		if (rows.isEmpty()) return null;
		return scalarValue(rows.getFirst(), "updated user card study mode").asString();
	}

	private CardDeckRow toDeckRow(Object raw) {
		NativeQueryRow row = NativeQueryRow.require(raw, 7, "card deck row");
		return new CardDeckRow(row.valueAt(0).asLong(), row.valueAt(1).asString(), row.valueAt(2).asString(), row.valueAt(3).asString(), row.valueAt(4).asString(), row.valueAt(5).asOffsetDateTime(), row.valueAt(6).asOffsetDateTime());
	}

	private CardDeckListRow toDeckListRow(Object raw) {
		NativeQueryRow row = NativeQueryRow.require(raw, 8, "card deck list row");
		return new CardDeckListRow(row.valueAt(0).asLong(), row.valueAt(1).asString(), row.valueAt(2).asString(), row.valueAt(3).asString(), row.valueAt(4).asString(), row.valueAt(5).asOffsetDateTime(), row.valueAt(6).asOffsetDateTime(), row.valueAt(7).asInt());
	}

	private CardDeckItemRow toItemRow(Object raw) {
		NativeQueryRow row = NativeQueryRow.require(raw, 11, "card deck item row");
		return new CardDeckItemRow(row.valueAt(0).asLong(), row.valueAt(1).asString(), row.valueAt(2).asLong(), row.valueAt(3).asString(), row.valueAt(4).asString(), row.valueAt(5).asString(), row.valueAt(6).asString(), row.valueAt(7).asOffsetDateTime(), row.valueAt(8).asOffsetDateTime(), row.valueAt(9).asOffsetDateTime(), row.valueAt(10).asOffsetDateTime());
	}

	private NativeQueryValue scalarValue(Object raw, String label) {
		return NativeQueryRow.require(raw, 1, label).valueAt(0);
	}

	private int asInt(Object value) { return new NativeQueryValue(value, "integer scalar").asInt(); }
}
