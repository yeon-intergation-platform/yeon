package world.yeon.backend.typing_decks.service;

public class TypingDeckServiceException extends RuntimeException {
	private final int status;
	private final String code;

	public TypingDeckServiceException(int status, String code, String message) {
		super(message);
		this.status = status;
		this.code = code;
	}

	public int status() { return status; }
	public String code() { return code; }
}
