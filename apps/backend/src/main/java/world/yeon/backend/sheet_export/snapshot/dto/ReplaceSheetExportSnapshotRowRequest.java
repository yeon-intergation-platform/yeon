package world.yeon.backend.sheet_export.snapshot.dto;

import world.yeon.backend.sheet_export.read.dto.SheetExportPayloadResponse;

public record ReplaceSheetExportSnapshotRowRequest(
	String memberId,
	SheetExportPayloadResponse payload
) {
}
