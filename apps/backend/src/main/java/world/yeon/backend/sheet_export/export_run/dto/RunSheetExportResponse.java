package world.yeon.backend.sheet_export.export_run.dto;

import java.time.OffsetDateTime;

public record RunSheetExportResponse(
	int exportedCount,
	OffsetDateTime lastSyncedAt
) {
}
