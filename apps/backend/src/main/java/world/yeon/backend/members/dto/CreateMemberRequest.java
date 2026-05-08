package world.yeon.backend.members.dto;

public record CreateMemberRequest(
	String name,
	String email,
	String phone,
	String status,
	String initialRiskLevel
) {}
