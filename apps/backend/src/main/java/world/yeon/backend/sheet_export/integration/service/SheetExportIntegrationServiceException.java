package world.yeon.backend.sheet_export.integration.service;

public class SheetExportIntegrationServiceException extends RuntimeException {
	private final int status;
	private final String code;

	public SheetExportIntegrationServiceException(int status, String message, String code) {
		super(message);
		this.status = status;
		this.code = code;
	}

	public int status() { return status; }
	public String code() { return code; }
}
