package world.yeon.backend.card_decks.merge_guest.service;

import world.yeon.backend.common.error.ApiException;

public class MergeGuestCardDeckServiceException extends ApiException {

	public MergeGuestCardDeckServiceException(int status, String code, String message) {
		super(status, code, message);
	}
}
