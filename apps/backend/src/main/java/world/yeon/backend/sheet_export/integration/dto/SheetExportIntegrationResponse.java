package world.yeon.backend.sheet_export.integration.dto;

import java.time.OffsetDateTime;

public record SheetExportIntegrationResponse(
	String publicId,
	String sheetUrl,
	String sheetId,
	String dataType,
	String columnMapping,
	OffsetDateTime lastSyncedAt,
	OffsetDateTime createdAt,
	OffsetDateTime updatedAt
) {
}
