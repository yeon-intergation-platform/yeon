package world.yeon.backend.card_decks.route.dto;

import java.util.List;

public record CreateCardDeckItemsRequest(List<CreateCardDeckItemRequest> items) {}
