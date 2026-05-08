package world.yeon.backend.sheet_export.read.dto;

import java.util.List;

public record SheetExportRowResponse(
	String memberId,
	List<String> values,
	SheetExportPayloadResponse payload
) {
}
