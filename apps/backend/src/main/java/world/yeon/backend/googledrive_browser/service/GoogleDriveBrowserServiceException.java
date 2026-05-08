package world.yeon.backend.googledrive_browser.service;

public class GoogleDriveBrowserServiceException extends RuntimeException {
	private final int status;
	private final String code;

	public GoogleDriveBrowserServiceException(int status, String code, String message) {
		super(message);
		this.status = status;
		this.code = code;
	}

	public int status() { return status; }
	public String code() { return code; }
}
