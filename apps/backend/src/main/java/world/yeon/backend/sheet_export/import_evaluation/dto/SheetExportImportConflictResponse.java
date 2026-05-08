package world.yeon.backend.sheet_export.import_evaluation.dto;

import java.util.List;

import world.yeon.backend.sheet_export.read.dto.SheetExportPayloadResponse;

public record SheetExportImportConflictResponse(
	String type,
	Integer rowNumber,
	String memberId,
	String memberName,
	List<String> changedFields,
	String message,
	SheetExportPayloadResponse base,
	SheetExportPayloadResponse sheet,
	SheetExportPayloadResponse server
) {
}
