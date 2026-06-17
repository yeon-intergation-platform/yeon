package world.yeon.backend.public_content.service;

public class PublicContentServiceException extends RuntimeException {
	private final int status;
	private final String code;

	public PublicContentServiceException(int status, String code, String message) {
		super(message);
		this.status = status;
		this.code = code;
	}

	public int status() {
		return status;
	}

	public String code() {
		return code;
	}
}
