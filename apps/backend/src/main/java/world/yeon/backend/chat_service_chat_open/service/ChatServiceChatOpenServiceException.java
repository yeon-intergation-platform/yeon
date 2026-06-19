package world.yeon.backend.chat_service_chat_open.service;

import world.yeon.backend.common.error.ApiException;

public class ChatServiceChatOpenServiceException extends ApiException {

	public ChatServiceChatOpenServiceException(int status, String code, String message) {
		super(status, code, message);
	}
}
