package world.yeon.backend.sheet_export.import_mutation.dto;

import java.util.List;

public record SheetExportImportMutationItemRequest(
	String memberPublicId,
	SheetExportImportMutationPayloadRequest payload,
	List<SheetExportImportMutationValueRequest> customValues
) {
}
