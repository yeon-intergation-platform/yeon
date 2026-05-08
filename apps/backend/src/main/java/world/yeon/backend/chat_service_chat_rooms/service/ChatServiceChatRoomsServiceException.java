package world.yeon.backend.chat_service_chat_rooms.service;

public class ChatServiceChatRoomsServiceException extends RuntimeException {
	private final int status;
	private final String code;

	public ChatServiceChatRoomsServiceException(int status, String code, String message) {
		super(message);
		this.status = status;
		this.code = code;
	}

	public int status() { return status; }
	public String code() { return code; }
}
