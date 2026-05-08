package world.yeon.backend.import_commit.dto;

import java.util.List;

public record ImportCommitResponse(
	ImportCreatedCountsResponse created,
	List<String> spaceIds
) {}
