package world.yeon.backend.sheet_export.import_context.dto;

import world.yeon.backend.sheet_export.read.dto.SheetExportPayloadResponse;

public record SheetExportImportContextMemberResponse(
	String memberId,
	String name,
	String email,
	String phone,
	String status,
	String initialRiskLevel,
	SheetExportPayloadResponse payload
) {
}
