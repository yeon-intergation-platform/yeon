package world.yeon.backend.chat_service_ask.service;

import world.yeon.backend.common.error.ApiException;

public class ChatServiceAskServiceException extends ApiException {

	public ChatServiceAskServiceException(int status, String code, String message) {
		super(status, code, message);
	}
}
