package world.yeon.backend.sheet_export.import_context.dto;

import java.time.OffsetDateTime;
import java.util.List;

import world.yeon.backend.sheet_export.snapshot.dto.SheetExportSnapshotItemResponse;

public record SheetExportImportContextResponse(
	OffsetDateTime lastSyncedAt,
	List<SheetExportImportContextFieldDefinitionResponse> fieldDefinitions,
	List<SheetExportImportContextMemberResponse> members,
	List<SheetExportSnapshotItemResponse> snapshots
) {
}
