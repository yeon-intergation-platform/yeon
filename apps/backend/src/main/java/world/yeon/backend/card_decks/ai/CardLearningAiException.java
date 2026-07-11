package world.yeon.backend.card_decks.ai;

import world.yeon.backend.common.error.ApiException;

public final class CardLearningAiException extends ApiException {
	public static final String INVALID_INPUT = "CARD_LEARNING_AI_INVALID_INPUT";
	public static final String NOT_CONFIGURED = "CARD_LEARNING_AI_NOT_CONFIGURED";
	public static final String AUTHENTICATION_FAILED = "CARD_LEARNING_AI_AUTHENTICATION_FAILED";
	public static final String RATE_LIMITED = "CARD_LEARNING_AI_RATE_LIMITED";
	public static final String UPSTREAM_REJECTED = "CARD_LEARNING_AI_UPSTREAM_REJECTED";
	public static final String UPSTREAM_UNAVAILABLE = "CARD_LEARNING_AI_UPSTREAM_UNAVAILABLE";
	public static final String REQUEST_TIMEOUT = "CARD_LEARNING_AI_REQUEST_TIMEOUT";
	public static final String REQUEST_INTERRUPTED = "CARD_LEARNING_AI_REQUEST_INTERRUPTED";
	public static final String INVALID_RESPONSE = "CARD_LEARNING_AI_INVALID_RESPONSE";

	public CardLearningAiException(int status, String code, String message) {
		super(status, code, message);
	}

	public CardLearningAiException(int status, String code, String message, Throwable cause) {
		super(status, code, message, cause);
	}
}
