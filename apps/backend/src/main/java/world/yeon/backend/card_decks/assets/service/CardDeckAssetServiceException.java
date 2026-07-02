package world.yeon.backend.card_decks.assets.service;

import world.yeon.backend.common.error.ApiException;

public class CardDeckAssetServiceException extends ApiException {

	public CardDeckAssetServiceException(int status, String code, String message) {
		super(status, code, message);
	}

	public CardDeckAssetServiceException(int status, String code, String message, Throwable cause) {
		super(status, code, message, cause);
	}
}
