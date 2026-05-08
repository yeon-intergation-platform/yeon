package world.yeon.backend.sheet_export.read.dto;

public record SheetExportPayloadCoreResponse(
	String name,
	String email,
	String phone,
	String status,
	String initialRiskLevel
) {
}
