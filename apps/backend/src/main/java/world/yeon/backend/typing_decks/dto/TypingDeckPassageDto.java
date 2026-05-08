package world.yeon.backend.typing_decks.dto;

public record TypingDeckPassageDto(
	String id,
	String title,
	String prompt,
	String textType,
	String difficulty,
	int sortOrder,
	String createdAt,
	String updatedAt
) {}
