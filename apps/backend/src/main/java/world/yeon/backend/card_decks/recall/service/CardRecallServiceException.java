package world.yeon.backend.card_decks.recall.service;

import world.yeon.backend.common.error.ApiException;

public class CardRecallServiceException extends ApiException {
	public CardRecallServiceException(int status, String code, String message) {
		super(status, code, message);
	}

	public CardRecallServiceException(int status, String code, String message, Throwable cause) {
		super(status, code, message, cause);
	}
}
