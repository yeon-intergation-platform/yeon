package world.yeon.backend.sheet_export.import_evaluation.dto;

public record SheetExportImportSummaryResponse(
	int created,
	int updated,
	int unchanged,
	int skipped,
	int conflicts
) {
}
