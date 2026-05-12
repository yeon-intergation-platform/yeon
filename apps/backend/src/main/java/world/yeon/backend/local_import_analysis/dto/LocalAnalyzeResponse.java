package world.yeon.backend.local_import_analysis.dto;

public record LocalAnalyzeResponse(
	String draftId,
	Object preview,
	String assistantMessage
) {}
