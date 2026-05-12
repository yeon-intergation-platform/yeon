package world.yeon.backend.root_auth.service;

public class AuthSessionServiceException extends RuntimeException {
	private final int status;
	private final String code;

	public AuthSessionServiceException(int status, String code, String message) {
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
