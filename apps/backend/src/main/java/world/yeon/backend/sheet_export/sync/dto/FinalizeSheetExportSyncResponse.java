package world.yeon.backend.sheet_export.sync.dto;

import java.time.OffsetDateTime;

public record FinalizeSheetExportSyncResponse(
	int exportedCount,
	OffsetDateTime lastSyncedAt
) {
}
