package world.yeon.backend.chat_service_blocks.service;

import world.yeon.backend.common.error.ApiException;

public class ChatServiceBlockServiceException extends ApiException {

	public ChatServiceBlockServiceException(int status, String code, String message) {
		super(status, code, message);
	}
}
