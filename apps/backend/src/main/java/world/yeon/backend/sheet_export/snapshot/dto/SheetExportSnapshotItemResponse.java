package world.yeon.backend.sheet_export.snapshot.dto;

import java.time.OffsetDateTime;

import world.yeon.backend.sheet_export.read.dto.SheetExportPayloadResponse;

public record SheetExportSnapshotItemResponse(
	String memberId,
	SheetExportPayloadResponse basePayload,
	String basePayloadHash,
	OffsetDateTime exportedAt
) {
}
