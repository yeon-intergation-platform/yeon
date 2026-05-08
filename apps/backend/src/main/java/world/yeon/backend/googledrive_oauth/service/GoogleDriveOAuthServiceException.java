package world.yeon.backend.googledrive_oauth.service;

public class GoogleDriveOAuthServiceException extends RuntimeException {
	private final int status;
	private final String code;

	public GoogleDriveOAuthServiceException(int status, String code, String message) {
		super(message);
		this.status = status;
		this.code = code;
	}

	public int status() { return status; }
	public String code() { return code; }
}
