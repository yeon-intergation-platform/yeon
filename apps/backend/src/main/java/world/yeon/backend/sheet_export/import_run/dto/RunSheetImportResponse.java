package world.yeon.backend.sheet_export.import_run.dto;

import java.time.OffsetDateTime;
import java.util.List;

import world.yeon.backend.sheet_export.import_evaluation.dto.SheetExportImportConflictResponse;
import world.yeon.backend.sheet_export.import_evaluation.dto.SheetExportImportSummaryResponse;

public record RunSheetImportResponse(
	String status,
	SheetExportImportSummaryResponse summary,
	List<SheetExportImportConflictResponse> conflicts,
	OffsetDateTime lastSyncedAt
) {
}
