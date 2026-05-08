package world.yeon.backend.sheet_export.sync.dto;

import java.time.OffsetDateTime;
import java.util.List;

import world.yeon.backend.sheet_export.snapshot.dto.ReplaceSheetExportSnapshotRowRequest;

public record FinalizeSheetExportSyncRequest(
	String sheetId,
	OffsetDateTime exportedAt,
	List<ReplaceSheetExportSnapshotRowRequest> rows
) {
}
