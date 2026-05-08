package world.yeon.backend.student_board_read.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record StudentBoardRowResponse(
	String memberId,
	String attendanceStatus,
	OffsetDateTime attendanceMarkedAt,
	String attendanceMarkedSource,
	String assignmentStatus,
	String assignmentLink,
	OffsetDateTime assignmentMarkedAt,
	String assignmentMarkedSource,
	OffsetDateTime lastPublicCheckAt,
	boolean isSelfCheckReady,
	List<StudentBoardDailyCellResponse> dailyCells
) {}
