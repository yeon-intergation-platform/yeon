package world.yeon.backend.sheet_integrations.dto;

import java.util.List;

public record GetSheetIntegrationsResponse(
	List<SheetIntegrationResponse> integrations
) {}
