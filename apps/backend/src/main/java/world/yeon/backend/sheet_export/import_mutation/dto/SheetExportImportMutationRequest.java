package world.yeon.backend.sheet_export.import_mutation.dto;

import java.util.List;

public record SheetExportImportMutationRequest(
	String sheetId,
	List<SheetExportImportMutationItemRequest> plannedCreates,
	List<SheetExportImportMutationItemRequest> plannedUpdates
) {
}
