package world.yeon.backend.members.dto;

public record UpdateMemberRequest(
	String name,
	String email,
	String phone,
	String status,
	String initialRiskLevel
) {}
