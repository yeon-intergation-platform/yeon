package world.yeon.backend.member_tabs.read.dto;

public record MemberTabItemResponse(
	String id,
	String name,
	String tabType,
	String systemKey,
	boolean isVisible,
	int displayOrder
) {
}
