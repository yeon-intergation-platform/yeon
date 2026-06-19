package world.yeon.backend.chat_service_chat_rooms.service;

import world.yeon.backend.common.error.ApiException;

public class ChatServiceChatRoomsServiceException extends ApiException {

	public ChatServiceChatRoomsServiceException(int status, String code, String message) {
		super(status, code, message);
	}
}
