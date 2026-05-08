package world.yeon.backend.sheet_export.import_mutation.dto;

public record SheetExportImportMutationValueRequest(
	String fieldDefinitionId,
	String value
) {
}
