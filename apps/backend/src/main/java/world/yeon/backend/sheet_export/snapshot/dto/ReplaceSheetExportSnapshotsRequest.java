package world.yeon.backend.sheet_export.snapshot.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record ReplaceSheetExportSnapshotsRequest(
	String sheetId,
	OffsetDateTime exportedAt,
	List<ReplaceSheetExportSnapshotRowRequest> rows
) {
}
