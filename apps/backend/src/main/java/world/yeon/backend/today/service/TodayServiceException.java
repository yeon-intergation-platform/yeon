package world.yeon.backend.today.service;

public class TodayServiceException extends RuntimeException {
	private final int status;
	private final String code;

	public TodayServiceException(int status, String code, String message) {
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
