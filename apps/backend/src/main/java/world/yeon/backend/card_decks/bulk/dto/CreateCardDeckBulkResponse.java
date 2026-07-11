package world.yeon.backend.card_decks.bulk.dto;

import java.util.List;
import world.yeon.backend.card_decks.route.dto.CardDeckDto;
import world.yeon.backend.card_decks.route.dto.CardDeckItemDto;

public record CreateCardDeckBulkResponse(
	CardDeckDto deck,
	List<CardDeckItemDto> items
) {}
