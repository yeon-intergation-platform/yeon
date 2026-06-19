package world.yeon.backend.card_decks.route.service;

import world.yeon.backend.common.error.ApiException;

public class CardDeckRouteServiceException extends ApiException {

	public CardDeckRouteServiceException(int status, String code, String message) {
		super(status, code, message);
	}
}
