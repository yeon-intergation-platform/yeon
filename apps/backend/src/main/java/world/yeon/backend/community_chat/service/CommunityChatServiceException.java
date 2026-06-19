package world.yeon.backend.community_chat.service;

import world.yeon.backend.common.error.ApiException;

public class CommunityChatServiceException extends ApiException {
	public CommunityChatServiceException(int status, String code, String message) {
		super(status, code, message);
	}
}
