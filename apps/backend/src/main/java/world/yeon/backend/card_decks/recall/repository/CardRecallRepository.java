package world.yeon.backend.card_decks.recall.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class CardRecallRepository {
	public record OwnedCard(
		long deckInternalId,
		long itemInternalId,
		String deckPublicId,
		String itemPublicId,
		String question,
		String answer,
		OffsetDateTime updatedAt
	) {}

	public record AttemptRow(
		String publicId,
		String deckPublicId,
		String itemPublicId,
		String question,
		String answer,
		String userAnswer,
		int score,
		String verdict,
		List<String> missedPoints,
		String feedback,
		String reviewDifficulty,
		OffsetDateTime lastReviewedAt,
		OffsetDateTime nextReviewAt,
		OffsetDateTime createdAt
	) {}

	private final JdbcTemplate jdbcTemplate;
	private final ObjectMapper objectMapper;

	public CardRecallRepository(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
		this.jdbcTemplate = jdbcTemplate;
		this.objectMapper = objectMapper;
	}

	public OwnedCard findOwnedCard(UUID userId, String deckPublicId, String itemPublicId) {
		return findOwnedCard(userId, deckPublicId, itemPublicId, false);
	}

	public OwnedCard lockOwnedCard(UUID userId, String deckPublicId, String itemPublicId) {
		return findOwnedCard(userId, deckPublicId, itemPublicId, true);
	}

	private OwnedCard findOwnedCard(
		UUID userId,
		String deckPublicId,
		String itemPublicId,
		boolean forUpdate
	) {
		String lockClause = forUpdate ? " for update of i" : "";
		List<OwnedCard> rows = jdbcTemplate.query(
			"""
			select d.id as deck_internal_id,
			       i.id as item_internal_id,
			       d.public_id as deck_public_id,
			       i.public_id as item_public_id,
			       i.front_text,
			       i.back_text,
			       i.updated_at
			from public.card_decks d
			join public.card_deck_items i on i.deck_id = d.id
			where d.owner_user_id = ? and d.public_id = ? and i.public_id = ?
			""" + lockClause,
			(row, index) -> new OwnedCard(
				row.getLong("deck_internal_id"),
				row.getLong("item_internal_id"),
				row.getString("deck_public_id"),
				row.getString("item_public_id"),
				row.getString("front_text"),
				row.getString("back_text"),
				row.getObject("updated_at", OffsetDateTime.class)
			),
			userId,
			deckPublicId,
			itemPublicId
		);
		return rows.isEmpty() ? null : rows.getFirst();
	}

	public boolean ownedDeckExists(UUID userId, String deckPublicId) {
		Boolean exists = jdbcTemplate.queryForObject(
			"select exists(select 1 from public.card_decks where owner_user_id = ? and public_id = ?)",
			Boolean.class,
			userId,
			deckPublicId
		);
		return Boolean.TRUE.equals(exists);
	}

	public AttemptRow findAttemptByIdempotencyKey(UUID userId, String idempotencyKey) {
		List<AttemptRow> rows = jdbcTemplate.query(
			attemptSelectSql() + " where a.owner_user_id = ? and a.idempotency_key = ? limit 1",
			this::mapAttempt,
			userId,
			idempotencyKey
		);
		return rows.isEmpty() ? null : rows.getFirst();
	}

	public List<AttemptRow> listAttempts(UUID userId, String deckPublicId, int limit) {
		return jdbcTemplate.query(
			attemptSelectSql()
				+ " where a.owner_user_id = ? and d.public_id = ? order by a.created_at desc, a.id desc limit ?",
			this::mapAttempt,
			userId,
			deckPublicId,
			limit
		);
	}

	public AttemptRow insertAttempt(
		String publicId,
		UUID userId,
		OwnedCard card,
		String idempotencyKey,
		String userAnswer,
		int score,
		String verdict,
		List<String> missedPoints,
		String feedback,
		String reviewDifficulty,
		OffsetDateTime lastReviewedAt,
		OffsetDateTime nextReviewAt,
		String model,
		OffsetDateTime createdAt
	) {
		String missedPointsJson = writeMissedPoints(missedPoints);
		List<AttemptRow> rows = jdbcTemplate.query(
			"""
			insert into yeon_backend.card_recall_attempts
			  (public_id, owner_user_id, deck_id, item_id, idempotency_key,
			   question_snapshot, answer_snapshot, user_answer, score, verdict,
			   missed_points, feedback, review_difficulty, last_reviewed_at,
			   next_review_at, model, created_at)
			values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, cast(? as jsonb), ?, ?, ?, ?, ?, ?)
			returning public_id, ? as deck_public_id, ? as item_public_id,
			          question_snapshot, answer_snapshot, user_answer, score, verdict,
			          missed_points::text, feedback, review_difficulty,
			          last_reviewed_at, next_review_at, created_at
			""",
			this::mapAttempt,
			publicId,
			userId,
			card.deckInternalId(),
			card.itemInternalId(),
			idempotencyKey,
			card.question(),
			card.answer(),
			userAnswer,
			score,
			verdict,
			missedPointsJson,
			feedback,
			reviewDifficulty,
			Timestamp.from(lastReviewedAt.toInstant()),
			Timestamp.from(nextReviewAt.toInstant()),
			model,
			Timestamp.from(createdAt.toInstant()),
			card.deckPublicId(),
			card.itemPublicId()
		);
		if (rows.isEmpty()) {
			throw new IllegalStateException("백지 시도 기록을 저장하지 못했습니다.");
		}
		return rows.getFirst();
	}

	public void updateItemReview(
		long itemInternalId,
		String difficulty,
		OffsetDateTime lastReviewedAt,
		OffsetDateTime nextReviewAt
	) {
		int updated = jdbcTemplate.update(
			"""
			update public.card_deck_items
			set review_difficulty = ?,
			    last_reviewed_at = ?,
			    next_review_at = ?,
			    updated_at = ?
			where id = ?
			""",
			difficulty,
			Timestamp.from(lastReviewedAt.toInstant()),
			Timestamp.from(nextReviewAt.toInstant()),
			Timestamp.from(lastReviewedAt.toInstant()),
			itemInternalId
		);
		if (updated != 1) {
			throw new IllegalStateException("백지 복습 일정을 저장하지 못했습니다.");
		}
	}

	private String attemptSelectSql() {
		return """
			select a.public_id,
			       d.public_id as deck_public_id,
			       i.public_id as item_public_id,
			       a.question_snapshot,
			       a.answer_snapshot,
			       a.user_answer,
			       a.score,
			       a.verdict,
			       a.missed_points::text,
			       a.feedback,
			       a.review_difficulty,
			       a.last_reviewed_at,
			       a.next_review_at,
			       a.created_at
			from yeon_backend.card_recall_attempts a
			join public.card_decks d on d.id = a.deck_id
			join public.card_deck_items i on i.id = a.item_id
			""";
	}

	private AttemptRow mapAttempt(java.sql.ResultSet row, int index) throws java.sql.SQLException {
		return new AttemptRow(
			row.getString("public_id"),
			row.getString("deck_public_id"),
			row.getString("item_public_id"),
			row.getString("question_snapshot"),
			row.getString("answer_snapshot"),
			row.getString("user_answer"),
			row.getInt("score"),
			row.getString("verdict"),
			readMissedPoints(row.getString("missed_points")),
			row.getString("feedback"),
			row.getString("review_difficulty"),
			row.getObject("last_reviewed_at", OffsetDateTime.class),
			row.getObject("next_review_at", OffsetDateTime.class),
			row.getObject("created_at", OffsetDateTime.class)
		);
	}

	private String writeMissedPoints(List<String> missedPoints) {
		try {
			return objectMapper.writeValueAsString(missedPoints);
		} catch (JsonProcessingException error) {
			throw new IllegalStateException("놓친 핵심 목록을 저장 형식으로 변환하지 못했습니다.", error);
		}
	}

	private List<String> readMissedPoints(String value) {
		try {
			return objectMapper.readValue(value, new TypeReference<>() {});
		} catch (JsonProcessingException error) {
			throw new IllegalStateException("저장된 놓친 핵심 목록을 해석하지 못했습니다.", error);
		}
	}
}
