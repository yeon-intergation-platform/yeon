package world.yeon.backend.sheet_export.import_mutation.dto;

import java.util.Map;

public record SheetExportImportMutationPayloadRequest(
	SheetExportImportMutationPayloadCoreRequest core,
	Map<String, String> customFields
) {
}
