package world.yeon.backend.members.dto;

import java.util.List;

public record GetMembersResponse(
	List<MemberResponse> members
) {}
