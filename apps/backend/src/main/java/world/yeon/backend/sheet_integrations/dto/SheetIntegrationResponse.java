package world.yeon.backend.sheet_integrations.dto;

import java.time.OffsetDateTime;

public record SheetIntegrationResponse(
	String publicId,
	String sheetUrl,
	String sheetId,
	String dataType,
	SheetIntegrationColumnMappingDto columnMapping,
	OffsetDateTime lastSyncedAt,
	OffsetDateTime createdAt,
	OffsetDateTime updatedAt
) {}
