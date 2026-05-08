package world.yeon.backend.import_drafts.dto;

public record ImportDraftFileResponse(
	String fileName,
	String mimeType,
	String base64
) {}
