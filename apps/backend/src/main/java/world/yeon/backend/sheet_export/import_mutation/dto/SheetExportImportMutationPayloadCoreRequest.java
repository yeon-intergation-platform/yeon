package world.yeon.backend.sheet_export.import_mutation.dto;

public record SheetExportImportMutationPayloadCoreRequest(
	String name,
	String email,
	String phone,
	String status,
	String initialRiskLevel
) {
}
