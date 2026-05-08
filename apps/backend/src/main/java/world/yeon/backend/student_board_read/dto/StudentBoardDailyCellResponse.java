package world.yeon.backend.student_board_read.dto;

public record StudentBoardDailyCellResponse(
	String date,
	String attendanceStatus,
	String assignmentStatus,
	String assignmentLink,
	String occurredAt,
	String source
) {}
