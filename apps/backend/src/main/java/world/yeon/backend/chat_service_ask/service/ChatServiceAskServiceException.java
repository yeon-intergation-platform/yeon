package world.yeon.backend.chat_service_ask.service;

public class ChatServiceAskServiceException extends RuntimeException {
	private final int status;
	private final String code;

	public ChatServiceAskServiceException(int status, String code, String message) {
		super(message);
		this.status = status;
		this.code = code;
	}

	public int status() { return status; }
	public String code() { return code; }
}
