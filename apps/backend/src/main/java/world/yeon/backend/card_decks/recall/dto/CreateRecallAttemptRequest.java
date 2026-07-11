package world.yeon.backend.card_decks.recall.dto;

public record CreateRecallAttemptRequest(String userAnswer, String idempotencyKey) {}
