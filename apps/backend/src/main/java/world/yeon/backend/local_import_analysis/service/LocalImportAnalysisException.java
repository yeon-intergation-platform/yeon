package world.yeon.backend.local_import_analysis.service;

public class LocalImportAnalysisException extends RuntimeException {
	private final int status;
	private final String code;

	public LocalImportAnalysisException(int status, String code, String message) {
		super(message);
		this.status = status;
		this.code = code;
	}

	public int status() { return status; }
	public String code() { return code; }
}
