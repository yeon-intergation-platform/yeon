package world.yeon.backend.typing_decks.dto;

import java.util.List;

public record TypingDeckDetailResponse(TypingDeckDto deck, List<TypingDeckPassageDto> passages) {}
