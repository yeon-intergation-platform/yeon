package world.yeon.backend.life_os.service;

public class LifeOsServiceException extends RuntimeException {
	private final int status;
	private final String code;

	public LifeOsServiceException(int status, String code, String message) {
		super(message);
		this.status = status;
		this.code = code;
	}

	public int status() { return status; }
	public String code() { return code; }
}
