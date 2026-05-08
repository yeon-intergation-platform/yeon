package world.yeon.backend.sheet_export.export_run.dto;

public record RunSheetExportRequest(
	String sheetId,
	String accessToken
) {
}
