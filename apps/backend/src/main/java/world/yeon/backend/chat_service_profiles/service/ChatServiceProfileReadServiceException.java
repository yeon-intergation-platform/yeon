package world.yeon.backend.chat_service_profiles.service;

import world.yeon.backend.common.error.ApiException;

public class ChatServiceProfileReadServiceException extends ApiException {

	public ChatServiceProfileReadServiceException(int status, String code, String message) {
		super(status, code, message);
	}
}
