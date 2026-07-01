package world.yeon.backend.game_service_common.service;

import world.yeon.backend.common.error.ApiException;

public class GameServiceException extends ApiException {
	public GameServiceException(int status, String code, String message) {
		super(status, code, message);
	}
}
