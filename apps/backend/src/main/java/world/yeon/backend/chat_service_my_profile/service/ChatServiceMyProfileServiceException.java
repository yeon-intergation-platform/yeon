package world.yeon.backend.chat_service_my_profile.service;

public class ChatServiceMyProfileServiceException extends RuntimeException {
	private final int status;
	private final String code;

	public ChatServiceMyProfileServiceException(int status, String code, String message) {
		super(message);
		this.status = status;
		this.code = code;
	}

	public int status() { return status; }
	public String code() { return code; }
}
