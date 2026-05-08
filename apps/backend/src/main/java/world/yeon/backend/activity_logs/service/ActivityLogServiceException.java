package world.yeon.backend.activity_logs.service;

public class ActivityLogServiceException extends RuntimeException {
	private final int status;
	private final String code;

	public ActivityLogServiceException(int status, String code, String message) {
		super(message);
		this.status = status;
		this.code = code;
	}

	public int status() { return status; }
	public String code() { return code; }
}
