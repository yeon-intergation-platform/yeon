package world.yeon.backend.chat_service_feed.service;

import world.yeon.backend.common.error.ApiException;

public class ChatServiceFeedServiceException extends ApiException {

	public ChatServiceFeedServiceException(int status, String code, String message) {
		super(status, code, message);
	}
}
