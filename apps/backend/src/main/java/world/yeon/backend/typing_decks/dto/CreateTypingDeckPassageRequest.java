package world.yeon.backend.typing_decks.dto;

public record CreateTypingDeckPassageRequest(
	String title,
	String prompt,
	String textType,
	String difficulty,
	Integer sortOrder
) {}
