package world.yeon.backend.onedrive_oauth.service;

public class OneDriveOAuthServiceException extends RuntimeException {
	private final int status;
	private final String code;

	public OneDriveOAuthServiceException(int status, String code, String message) {
		super(message);
		this.status = status;
		this.code = code;
	}

	public int status() { return status; }
	public String code() { return code; }
}
