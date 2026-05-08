package world.yeon.backend.card_decks.route.dto;

public record CardDeckDto(
	String id,
	String title,
	String description,
	int itemCount,
	String createdAt,
	String updatedAt
) {}
