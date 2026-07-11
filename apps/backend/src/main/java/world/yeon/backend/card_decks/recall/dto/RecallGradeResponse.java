package world.yeon.backend.card_decks.recall.dto;

import java.util.List;

public record RecallGradeResponse(
	String attemptId,
	int score,
	String verdict,
	List<String> missedPoints,
	String feedback,
	String reviewDifficulty,
	String lastReviewedAt,
	String nextReviewAt,
	String createdAt
) {}
