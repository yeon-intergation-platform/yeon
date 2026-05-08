package world.yeon.backend.sheet_export.import_evaluation.dto;

import java.util.List;

import world.yeon.backend.sheet_export.read.dto.SheetExportPayloadResponse;

public record SheetExportImportPlannedMutationResponse(
	String memberPublicId,
	SheetExportPayloadResponse payload,
	List<SheetExportImportPlannedValueResponse> customValues
) {
}
