package world.yeon.backend.import_commit.dto;

public record ImportCommitRequest(
	String draftId,
	ImportPreviewRequest preview
) {}
