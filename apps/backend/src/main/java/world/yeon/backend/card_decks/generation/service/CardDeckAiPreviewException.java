package world.yeon.backend.card_decks.generation.service;

import world.yeon.backend.common.error.ApiException;

public final class CardDeckAiPreviewException extends ApiException {
	public CardDeckAiPreviewException(int status, String code, String message) {
		super(status, code, message);
	}

	public CardDeckAiPreviewException(int status, String code, String message, Throwable cause) {
		super(status, code, message, cause);
	}
}
