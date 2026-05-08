package world.yeon.backend.member_tabs.write.dto;

public record MemberTabMutationItemResponse(
	String id,
	String name,
	String tabType,
	String systemKey,
	boolean isVisible,
	int displayOrder
) {
}
