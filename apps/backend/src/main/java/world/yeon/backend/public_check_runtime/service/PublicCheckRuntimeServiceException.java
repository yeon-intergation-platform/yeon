package world.yeon.backend.public_check_runtime.service;

public class PublicCheckRuntimeServiceException extends RuntimeException {
	private final int status;
	private final String code;

	public PublicCheckRuntimeServiceException(int status, String code, String message) {
		super(message);
		this.status = status;
		this.code = code;
	}

	public int status() { return status; }
	public String code() { return code; }
}
