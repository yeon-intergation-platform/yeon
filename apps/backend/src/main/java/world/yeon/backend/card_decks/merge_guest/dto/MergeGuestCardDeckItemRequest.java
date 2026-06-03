package world.yeon.backend.card_decks.merge_guest.dto;

public record MergeGuestCardDeckItemRequest(
	String frontText,
	String backText,
	String imageStorageKey
) {}
