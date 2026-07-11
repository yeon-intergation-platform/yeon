package world.yeon.backend.card_decks.generation.dto;

public record CardDeckAiPreviewRequest(
	String idempotencyKey,
	String sourceText,
	String instruction,
	Integer itemCount
) {}
