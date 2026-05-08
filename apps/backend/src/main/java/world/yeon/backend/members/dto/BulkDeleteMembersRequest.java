package world.yeon.backend.members.dto;

import java.util.List;

public record BulkDeleteMembersRequest(
	List<String> memberIds
) {}
