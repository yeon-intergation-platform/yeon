package world.yeon.backend.import_drafts.dto;

public record ImportDraftSnapshotResponse(
	String id,
	String provider,
	String status,
	ImportDraftSourceFileResponse selectedFile,
	Object preview,
	Object importResult,
	String error,
	String processingStage,
	Integer processingProgress,
	String processingMessage,
	String expiresAt,
	String updatedAt
) {}
