package world.yeon.backend.sheet_integrations.dto;

public record CreateSheetIntegrationRequest(
	String sheetUrl,
	String dataType,
	SheetIntegrationColumnMappingDto columnMapping
) {}
