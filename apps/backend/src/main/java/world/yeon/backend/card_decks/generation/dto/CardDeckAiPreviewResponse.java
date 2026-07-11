package world.yeon.backend.card_decks.generation.dto;

import java.util.List;

public record CardDeckAiPreviewResponse(
	String title,
	String description,
	List<CardDeckAiDraftItem> items
) {
	public CardDeckAiPreviewResponse {
		items = items == null ? List.of() : List.copyOf(items);
	}
}
