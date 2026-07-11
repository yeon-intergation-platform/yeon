package world.yeon.backend.card_decks.bulk.repository;

import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class CardDeckBulkRepository {
	public record DeckRow(
		long internalId,
		String publicId,
		UUID ownerUserId,
		String title,
		String description,
		OffsetDateTime createdAt,
		OffsetDateTime updatedAt
	) {}

	public record ItemRow(
		long internalId,
		String publicId,
		long deckId,
		String frontText,
		String backText,
		String imageStorageKey,
		String reviewDifficulty,
		OffsetDateTime lastReviewedAt,
		OffsetDateTime nextReviewAt,
		OffsetDateTime createdAt,
		OffsetDateTime updatedAt
	) {}

	public record CreationRequestRow(
		UUID ownerUserId,
		UUID idempotencyKey,
		long deckInternalId,
		String requestFingerprint,
		String responsePayload,
		OffsetDateTime createdAt
	) {}

	private final JdbcTemplate jdbcTemplate;

	public CardDeckBulkRepository(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	public void acquireCreationLock(UUID userId, UUID idempotencyKey) {
		jdbcTemplate.query(
			"select pg_advisory_xact_lock(hashtext(?))",
			row -> {
				// 동일 사용자의 동일 생성 키를 현재 트랜잭션 동안 직렬화한다.
			},
			userId + ":card-deck-bulk:" + idempotencyKey
		);
	}

	public CreationRequestRow findCreationRequest(UUID userId, UUID idempotencyKey) {
		List<CreationRequestRow> rows = jdbcTemplate.query(
			"""
				select r.owner_user_id, r.idempotency_key, r.deck_id, r.request_fingerprint,
				       r.response_payload::text, r.created_at
				from yeon_backend.card_deck_bulk_requests r
				join public.card_decks d on d.id = r.deck_id
				where r.owner_user_id = ? and r.idempotency_key = ?
				limit 1
				for key share of d
			""",
			(row, index) -> new CreationRequestRow(
					row.getObject("owner_user_id", UUID.class),
					row.getObject("idempotency_key", UUID.class),
					row.getLong("deck_id"),
					row.getString("request_fingerprint"),
				row.getString("response_payload"),
				row.getObject("created_at", OffsetDateTime.class)
			),
			userId,
			idempotencyKey
		);
		return rows.isEmpty() ? null : rows.getFirst();
	}

	public void insertCreationRequest(
		UUID userId,
		UUID idempotencyKey,
		long deckInternalId,
		String requestFingerprint,
		String responsePayload,
		OffsetDateTime createdAt
	) {
		int updated = jdbcTemplate.update(
			"""
			insert into yeon_backend.card_deck_bulk_requests
				  (owner_user_id, idempotency_key, deck_id, request_fingerprint, response_payload, created_at)
				values (?, ?, ?, ?, cast(? as jsonb), ?)
			""",
				userId,
				idempotencyKey,
				deckInternalId,
				requestFingerprint,
			responsePayload,
			Timestamp.from(createdAt.toInstant())
		);
		if (updated != 1) {
			throw new IllegalStateException("카드 덱 bulk 생성 멱등 결과를 저장하지 못했습니다.");
		}
	}

	public List<ItemRow> listItems(long deckId) {
		return jdbcTemplate.query(
			"""
			select id, public_id, deck_id, front_text, back_text, image_storage_key,
			       review_difficulty, last_reviewed_at, next_review_at, created_at, updated_at
			from public.card_deck_items
			where deck_id = ?
			order by id asc
			""",
			(row, index) -> toItemRow(row),
			deckId
		);
	}

	public DeckRow insertDeck(
		String publicId,
		UUID userId,
		String title,
		String description,
		OffsetDateTime now
	) {
		List<DeckRow> rows = jdbcTemplate.query(
			"""
			insert into public.card_decks (
				  public_id, owner_user_id, title, description, created_at, updated_at
				)
				values (?, ?, ?, ?, ?, ?)
				returning id, public_id, owner_user_id, title, description, created_at, updated_at
			""",
			(row, index) -> toDeckRow(row),
			publicId,
				userId,
				title,
				description,
				Timestamp.from(now.toInstant()),
			Timestamp.from(now.toInstant())
		);
		return rows.isEmpty() ? null : rows.getFirst();
	}

	public ItemRow insertItem(
		String publicId,
		long deckId,
		String frontText,
		String backText,
		String imageStorageKey,
		OffsetDateTime now
	) {
		List<ItemRow> rows = jdbcTemplate.query(
			"""
			insert into public.card_deck_items (
			  public_id, deck_id, front_text, back_text, image_storage_key,
			  created_at, updated_at
			)
			values (?, ?, ?, ?, ?, ?, ?)
			returning id, public_id, deck_id, front_text, back_text, image_storage_key,
			          review_difficulty, last_reviewed_at, next_review_at, created_at, updated_at
			""",
			(row, index) -> toItemRow(row),
			publicId,
			deckId,
			frontText,
			backText,
			imageStorageKey,
			Timestamp.from(now.toInstant()),
			Timestamp.from(now.toInstant())
		);
		return rows.isEmpty() ? null : rows.getFirst();
	}

	private DeckRow toDeckRow(java.sql.ResultSet row) throws java.sql.SQLException {
		return new DeckRow(
			row.getLong("id"),
			row.getString("public_id"),
				row.getObject("owner_user_id", UUID.class),
				row.getString("title"),
				row.getString("description"),
				row.getObject("created_at", OffsetDateTime.class),
			row.getObject("updated_at", OffsetDateTime.class)
		);
	}

	private ItemRow toItemRow(java.sql.ResultSet row) throws java.sql.SQLException {
		return new ItemRow(
			row.getLong("id"),
			row.getString("public_id"),
			row.getLong("deck_id"),
			row.getString("front_text"),
			row.getString("back_text"),
			row.getString("image_storage_key"),
			row.getString("review_difficulty"),
			row.getObject("last_reviewed_at", OffsetDateTime.class),
			row.getObject("next_review_at", OffsetDateTime.class),
			row.getObject("created_at", OffsetDateTime.class),
			row.getObject("updated_at", OffsetDateTime.class)
		);
	}
}
