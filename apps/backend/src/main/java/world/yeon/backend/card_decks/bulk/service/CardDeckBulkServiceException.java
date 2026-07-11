package world.yeon.backend.card_decks.bulk.service;

import world.yeon.backend.common.error.ApiException;

public class CardDeckBulkServiceException extends ApiException {
	public CardDeckBulkServiceException(int status, String code, String message) {
		super(status, code, message);
	}

	public CardDeckBulkServiceException(int status, String code, String message, Throwable cause) {
		super(status, code, message, cause);
	}
}
