package world.yeon.backend.card_decks.recall.dto;

import java.util.List;

public record RecallAttemptResponse(
	String attemptId,
	int score,
	String verdict,
	List<String> missedPoints,
	String feedback,
	String reviewDifficulty,
	String lastReviewedAt,
	String nextReviewAt,
	String createdAt,
	String deckId,
	String itemId,
	String question,
	String answer,
	String userAnswer
) {}
