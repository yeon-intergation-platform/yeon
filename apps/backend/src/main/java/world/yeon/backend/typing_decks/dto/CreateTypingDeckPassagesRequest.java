package world.yeon.backend.typing_decks.dto;

import java.util.List;

public record CreateTypingDeckPassagesRequest(List<CreateTypingDeckPassageRequest> passages) {}
