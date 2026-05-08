package world.yeon.backend.sheet_integrations.dto;

public record SyncSheetIntegrationResponse(
	int synced,
	int errors
) {}
