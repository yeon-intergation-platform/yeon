package world.yeon.backend.card_decks.bulk.dto;

public record CreateCardDeckBulkItemRequest(
	String frontText,
	String backText,
	String imageStorageKey
) {}
