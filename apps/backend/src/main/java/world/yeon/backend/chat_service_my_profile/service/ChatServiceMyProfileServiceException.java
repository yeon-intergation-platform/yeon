package world.yeon.backend.chat_service_my_profile.service;

import world.yeon.backend.common.error.ApiException;

public class ChatServiceMyProfileServiceException extends ApiException {

	public ChatServiceMyProfileServiceException(int status, String code, String message) {
		super(status, code, message);
	}
}
