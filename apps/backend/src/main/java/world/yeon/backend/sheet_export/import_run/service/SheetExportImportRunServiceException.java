package world.yeon.backend.sheet_export.import_run.service;

public class SheetExportImportRunServiceException extends RuntimeException {
	private final int status;
	private final String code;

	public SheetExportImportRunServiceException(int status, String code, String message) {
		super(message);
		this.status = status;
		this.code = code;
	}

	public int status() { return status; }
	public String code() { return code; }
}
