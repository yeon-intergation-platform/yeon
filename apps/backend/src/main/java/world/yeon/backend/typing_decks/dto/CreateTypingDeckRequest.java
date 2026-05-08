package world.yeon.backend.typing_decks.dto;

public record CreateTypingDeckRequest(
	String title,
	String description,
	String languageTag,
	String visibility
) {}
