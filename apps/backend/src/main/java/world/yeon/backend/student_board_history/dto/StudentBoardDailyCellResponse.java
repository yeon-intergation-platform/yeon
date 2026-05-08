package world.yeon.backend.student_board_history.dto;

public record StudentBoardDailyCellResponse(
	String date,
	String attendanceStatus,
	String assignmentStatus,
	String assignmentLink,
	String occurredAt,
	String source
) {}
