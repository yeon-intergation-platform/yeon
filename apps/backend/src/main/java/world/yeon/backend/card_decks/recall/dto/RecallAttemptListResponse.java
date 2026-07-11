package world.yeon.backend.card_decks.recall.dto;

import java.util.List;

public record RecallAttemptListResponse(List<RecallAttemptResponse> attempts) {}
