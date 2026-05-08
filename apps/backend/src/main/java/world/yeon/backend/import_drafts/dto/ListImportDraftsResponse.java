package world.yeon.backend.import_drafts.dto;

import java.util.List;

public record ListImportDraftsResponse(
	List<ImportDraftSnapshotResponse> drafts
) {}
