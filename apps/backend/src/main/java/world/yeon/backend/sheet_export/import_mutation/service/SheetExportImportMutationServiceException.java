package world.yeon.backend.sheet_export.import_mutation.service;

public class SheetExportImportMutationServiceException extends RuntimeException {
	private final int status;
	private final String code;

	public SheetExportImportMutationServiceException(int status, String message, String code) {
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
