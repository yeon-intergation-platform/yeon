package world.yeon.backend.chat_service_blocks.service;

public class ChatServiceBlockServiceException extends RuntimeException {
	private final int status;
	private final String code;

	public ChatServiceBlockServiceException(int status, String code, String message) {
		super(message);
		this.status = status;
		this.code = code;
	}

	public int status() { return status; }
	public String code() { return code; }
}
