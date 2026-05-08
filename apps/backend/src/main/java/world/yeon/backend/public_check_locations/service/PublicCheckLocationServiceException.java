package world.yeon.backend.public_check_locations.service;

public class PublicCheckLocationServiceException extends RuntimeException {
	private final int status;
	private final String code;

	public PublicCheckLocationServiceException(int status, String code, String message) {
		super(message);
		this.status = status;
		this.code = code;
	}

	public int status() { return status; }
	public String code() { return code; }
}
