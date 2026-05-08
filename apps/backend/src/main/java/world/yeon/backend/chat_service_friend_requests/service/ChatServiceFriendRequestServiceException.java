package world.yeon.backend.chat_service_friend_requests.service;

public class ChatServiceFriendRequestServiceException extends RuntimeException {
	private final int status;
	private final String code;

	public ChatServiceFriendRequestServiceException(int status, String code, String message) {
		super(message);
		this.status = status;
		this.code = code;
	}

	public int status() { return status; }
	public String code() { return code; }
}
