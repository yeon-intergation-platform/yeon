package world.yeon.backend.student_board_history.dto;

public record StudentBoardHistoryItemResponse(
	String id,
	String memberId,
	String memberName,
	String historyDate,
	String occurredAt,
	String attendanceStatus,
	String assignmentStatus,
	String assignmentLink,
	String source
) {}
