package world.yeon.backend.sheet_export.read.dto;

import java.util.Map;

public record SheetExportPayloadResponse(
	SheetExportPayloadCoreResponse core,
	Map<String, String> customFields
) {
}
