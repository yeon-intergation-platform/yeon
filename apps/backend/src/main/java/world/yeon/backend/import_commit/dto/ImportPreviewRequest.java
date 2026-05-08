package world.yeon.backend.import_commit.dto;

import java.util.List;

public record ImportPreviewRequest(
	List<ImportCohortRequest> cohorts
) {}
