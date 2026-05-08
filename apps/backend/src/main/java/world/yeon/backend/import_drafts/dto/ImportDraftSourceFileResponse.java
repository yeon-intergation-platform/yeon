package world.yeon.backend.import_drafts.dto;

public record ImportDraftSourceFileResponse(
	String id,
	String name,
	int size,
	String lastModifiedAt,
	String mimeType,
	boolean isFolder,
	boolean isSpreadsheet,
	boolean isImage,
	String fileKind
) {}
