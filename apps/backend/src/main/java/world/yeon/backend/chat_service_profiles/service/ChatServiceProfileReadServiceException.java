package world.yeon.backend.chat_service_profiles.service;

public class ChatServiceProfileReadServiceException extends RuntimeException {
	private final int status;
	private final String code;

	public ChatServiceProfileReadServiceException(int status, String code, String message) {
		super(message);
		this.status = status;
		this.code = code;
	}

	public int status() { return status; }
	public String code() { return code; }
}
