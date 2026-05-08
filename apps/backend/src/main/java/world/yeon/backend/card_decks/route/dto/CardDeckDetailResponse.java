package world.yeon.backend.card_decks.route.dto;

import java.util.List;

public record CardDeckDetailResponse(
	CardDeckDto deck,
	List<CardDeckItemDto> items,
	String studyMode
) {}
