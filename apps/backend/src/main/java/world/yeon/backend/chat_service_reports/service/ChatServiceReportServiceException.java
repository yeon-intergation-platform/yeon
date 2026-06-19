package world.yeon.backend.chat_service_reports.service;

import world.yeon.backend.common.error.ApiException;

public class ChatServiceReportServiceException extends ApiException {

	public ChatServiceReportServiceException(int status, String code, String message) {
		super(status, code, message);
	}
}
