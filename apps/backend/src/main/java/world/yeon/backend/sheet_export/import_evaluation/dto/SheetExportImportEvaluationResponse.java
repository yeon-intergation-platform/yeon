package world.yeon.backend.sheet_export.import_evaluation.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record SheetExportImportEvaluationResponse(
	String status,
	SheetExportImportSummaryResponse summary,
	List<SheetExportImportConflictResponse> conflicts,
	OffsetDateTime lastSyncedAt,
	List<SheetExportImportPlannedMutationResponse> plannedCreates,
	List<SheetExportImportPlannedMutationResponse> plannedUpdates
) {
}
