package world.yeon.backend.card_decks.route.dto;

public record CardDeckItemDto(
	String id,
	String frontText,
	String backText,
	String reviewDifficulty,
	String lastReviewedAt,
	String nextReviewAt,
	String createdAt,
	String updatedAt
) {}
