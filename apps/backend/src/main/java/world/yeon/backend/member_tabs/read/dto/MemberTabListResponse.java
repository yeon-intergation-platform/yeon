package world.yeon.backend.member_tabs.read.dto;

import java.util.List;

public record MemberTabListResponse(
	List<MemberTabItemResponse> tabs
) {
}
