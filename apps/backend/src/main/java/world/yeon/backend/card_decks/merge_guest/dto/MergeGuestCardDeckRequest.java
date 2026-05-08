package world.yeon.backend.card_decks.merge_guest.dto;

import java.util.List;

public record MergeGuestCardDeckRequest(
	String title,
	String description,
	List<MergeGuestCardDeckItemRequest> items
) {}
