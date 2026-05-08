package world.yeon.backend.public_check_sessions.service;

public class PublicCheckSessionServiceException extends RuntimeException {
	private final int status;
	private final String code;

	public PublicCheckSessionServiceException(int status, String code, String message) {
		super(message);
		this.status = status;
		this.code = code;
	}

	public int status() { return status; }
	public String code() { return code; }
}
