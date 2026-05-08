package world.yeon.backend.member_tabs.reorder.dto;

import java.util.List;

public record ReorderMemberTabsRequest(
	List<String> order
) {
}
