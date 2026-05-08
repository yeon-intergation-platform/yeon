package world.yeon.backend.typing_decks.dto;

public record TypingDeckDto(
	String id,
	String title,
	String description,
	String languageTag,
	String visibility,
	String source,
	int passageCount,
	boolean isOwner,
	boolean canEdit,
	String createdAt,
	String updatedAt
) {}
