package world.yeon.backend.sheet_export.import_evaluation.dto;

import java.util.List;

public record SheetExportImportEvaluationRequest(
	String sheetId,
	List<List<String>> rows
) {
}
