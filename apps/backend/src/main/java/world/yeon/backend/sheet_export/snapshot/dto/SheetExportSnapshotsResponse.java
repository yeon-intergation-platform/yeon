package world.yeon.backend.sheet_export.snapshot.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record SheetExportSnapshotsResponse(
	OffsetDateTime lastSyncedAt,
	List<SheetExportSnapshotItemResponse> snapshots
) {
}
