package world.yeon.backend.typing_character_frames.service;

import world.yeon.backend.common.error.ApiException;

public class TypingCharacterFrameServiceException extends ApiException {

	public TypingCharacterFrameServiceException(int status, String code, String message) {
		super(status, code, message);
	}
}
