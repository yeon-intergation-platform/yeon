package world.yeon.backend.sheet_export.read.dto;

import java.util.List;

public record SheetExportRowsResponse(
	List<SheetExportFieldDefinitionResponse> fieldDefinitions,
	List<SheetExportRowResponse> rows
) {
}
