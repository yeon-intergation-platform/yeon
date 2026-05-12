package world.yeon.backend.typing_character_frames.service;

public class TypingCharacterFrameServiceException extends RuntimeException {
	private final int status;
	private final String code;

	public TypingCharacterFrameServiceException(int status, String code, String message) {
		super(message);
		this.status = status;
		this.code = code;
	}

	public int status() { return status; }
	public String code() { return code; }
}
