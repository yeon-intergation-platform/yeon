package world.yeon.backend.typing_decks.service;

import world.yeon.backend.common.error.ApiException;

public class TypingDeckServiceException extends ApiException {

	public TypingDeckServiceException(int status, String code, String message) {
		super(status, code, message);
	}
}
