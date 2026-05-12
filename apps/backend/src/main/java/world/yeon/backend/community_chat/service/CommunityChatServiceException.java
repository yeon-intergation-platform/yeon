package world.yeon.backend.community_chat.service;

public class CommunityChatServiceException extends RuntimeException {
	private final int status;
	private final String code;

	public CommunityChatServiceException(int status, String code, String message) {
		super(message);
		this.status = status;
		this.code = code;
	}

	public int status() { return status; }
	public String code() { return code; }
}
