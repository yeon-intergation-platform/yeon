package world.yeon.backend.sheet_integrations.dto;

public record SheetIntegrationColumnMappingDto(
	Integer nameColumn,
	Integer dateColumn,
	Integer statusColumn,
	Integer typeColumn
) {}
