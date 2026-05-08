package world.yeon.backend.import_drafts.service;

public class ImportDraftServiceException extends RuntimeException {
	private final int status;
	private final String code;

	public ImportDraftServiceException(int status, String code, String message) {
		super(message);
		this.status = status;
		this.code = code;
	}

	public int status() { return status; }
	public String code() { return code; }
}
