package world.yeon.backend.chat_service_friend_requests.service;

import world.yeon.backend.common.error.ApiException;

public class ChatServiceFriendRequestServiceException extends ApiException {

	public ChatServiceFriendRequestServiceException(int status, String code, String message) {
		super(status, code, message);
	}
}
