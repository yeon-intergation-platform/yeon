package world.yeon.backend.members.dto;

import java.util.List;

public record BulkDeleteMembersResponse(
	int deletedCount,
	List<String> deletedIds
) {}
