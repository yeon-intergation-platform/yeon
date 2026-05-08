package world.yeon.backend.card_decks.merge_guest.dto;

import java.util.List;

public record MergeGuestRequest(
	List<MergeGuestCardDeckRequest> decks
) {}
