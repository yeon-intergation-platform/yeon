package world.yeon.backend.card_decks.route.repository;

import jakarta.persistence.EntityManager;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@Profile("jdbc")
public class CardDeckRouteRepository {
	public record CardDeckRow(Long internalId, String publicId, String ownerUserId, String title, String description, OffsetDateTime createdAt, OffsetDateTime updatedAt) {}
	public record CardDeckListRow(Long internalId, String publicId, String ownerUserId, String title, String description, OffsetDateTime createdAt, OffsetDateTime updatedAt, int itemCount) {}
	public record CardDeckItemRow(Long internalId, String publicId, Long deckId, String frontText, String backText, String reviewDifficulty, OffsetDateTime lastReviewedAt, OffsetDateTime nextReviewAt, OffsetDateTime createdAt, OffsetDateTime updatedAt) {}

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
			select id, public_id, deck_id, front_text, back_text, review_difficulty, last_reviewed_at, next_review_at, created_at, updated_at
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
			select i.id, i.public_id, i.deck_id, i.front_text, i.back_text, i.review_difficulty, i.last_reviewed_at, i.next_review_at, i.created_at, i.updated_at
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
		Object raw = rows.getFirst();
		if (raw instanceof Object[] values) return values[0] == null ? null : values[0].toString();
		return raw == null ? null : raw.toString();
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
	public CardDeckItemRow insertItem(String publicId, Long deckId, String frontText, String backText, OffsetDateTime now) {
		List<?> rows = entityManager.createNativeQuery("""
			insert into public.card_deck_items (public_id, deck_id, front_text, back_text, created_at, updated_at)
			values (:publicId, :deckId, :frontText, :backText, :createdAt, :updatedAt)
			returning id, public_id, deck_id, front_text, back_text, review_difficulty, last_reviewed_at, next_review_at, created_at, updated_at
		""")
			.setParameter("publicId", publicId)
			.setParameter("deckId", deckId)
			.setParameter("frontText", frontText)
			.setParameter("backText", backText)
			.setParameter("createdAt", Timestamp.from(now.toInstant()))
			.setParameter("updatedAt", Timestamp.from(now.toInstant()))
			.getResultList();
		return rows.isEmpty() ? null : toItemRow(rows.getFirst());
	}

	@Transactional
	public CardDeckItemRow updateItem(Long itemId, String frontText, String backText, OffsetDateTime now) {
		List<?> rows = entityManager.createNativeQuery("""
			update public.card_deck_items
			set front_text = :frontText,
			    back_text = :backText,
			    updated_at = :updatedAt
			where id = :itemId
			returning id, public_id, deck_id, front_text, back_text, review_difficulty, last_reviewed_at, next_review_at, created_at, updated_at
		""")
			.setParameter("itemId", itemId)
			.setParameter("frontText", frontText)
			.setParameter("backText", backText)
			.setParameter("updatedAt", Timestamp.from(now.toInstant()))
			.getResultList();
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
			returning id, public_id, deck_id, front_text, back_text, review_difficulty, last_reviewed_at, next_review_at, created_at, updated_at
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
		Object raw = rows.getFirst();
		if (raw instanceof Object[] values) return values[0] == null ? null : values[0].toString();
		return raw == null ? null : raw.toString();
	}

	private CardDeckRow toDeckRow(Object raw) {
		Object[] v = toValues(raw, 7, "card deck row");
		return new CardDeckRow(asLong(v[0]), asString(v[1]), asString(v[2]), asString(v[3]), asString(v[4]), asOffsetDateTime(v[5]), asOffsetDateTime(v[6]));
	}

	private CardDeckListRow toDeckListRow(Object raw) {
		Object[] v = toValues(raw, 8, "card deck list row");
		return new CardDeckListRow(asLong(v[0]), asString(v[1]), asString(v[2]), asString(v[3]), asString(v[4]), asOffsetDateTime(v[5]), asOffsetDateTime(v[6]), asInt(v[7]));
	}

	private CardDeckItemRow toItemRow(Object raw) {
		Object[] v = toValues(raw, 10, "card deck item row");
		return new CardDeckItemRow(asLong(v[0]), asString(v[1]), asLong(v[2]), asString(v[3]), asString(v[4]), asString(v[5]), asOffsetDateTime(v[6]), asOffsetDateTime(v[7]), asOffsetDateTime(v[8]), asOffsetDateTime(v[9]));
	}

	private Object[] toValues(Object raw, int min, String label) {
		if (!(raw instanceof Object[] values) || values.length < min) {
			throw new IllegalStateException(label + "를 해석하지 못했습니다.");
		}
		return values;
	}

	private String asString(Object value) { return value == null ? null : value.toString(); }
	private Long asLong(Object value) { return value instanceof Number n ? n.longValue() : Long.parseLong(value.toString()); }
	private int asInt(Object value) { return value instanceof Number n ? n.intValue() : Integer.parseInt(value.toString()); }
	private OffsetDateTime asOffsetDateTime(Object value) {
		if (value == null) return null;
		if (value instanceof OffsetDateTime offsetDateTime) return offsetDateTime;
		if (value instanceof Timestamp timestamp) return timestamp.toInstant().atOffset(ZoneOffset.UTC);
		if (value instanceof Instant instant) return instant.atOffset(ZoneOffset.UTC);
		if (value instanceof Date date) return date.toInstant().atOffset(ZoneOffset.UTC);
		if (value instanceof ZonedDateTime zonedDateTime) return zonedDateTime.toOffsetDateTime();
		return OffsetDateTime.parse(value.toString());
	}
}
