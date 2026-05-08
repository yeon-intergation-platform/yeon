package world.yeon.backend.sheet_export.import_run.dto;

public record RunSheetImportRequest(
	String sheetId,
	String accessToken
) {
}
