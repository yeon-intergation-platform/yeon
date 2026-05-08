package world.yeon.backend.import_commit.service;

public class ImportCommitServiceException extends RuntimeException {
	private final int status;
	private final String code;

	public ImportCommitServiceException(int status, String code, String message) {
		super(message);
		this.status = status;
		this.code = code;
	}

	public int status() { return status; }
	public String code() { return code; }
}
