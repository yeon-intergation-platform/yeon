package world.yeon.backend.member_tabs.write.dto;

public record UpdateMemberTabRequest(
	String name,
	Boolean isVisible,
	Integer displayOrder
) {
}
