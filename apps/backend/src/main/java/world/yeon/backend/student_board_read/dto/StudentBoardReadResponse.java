package world.yeon.backend.student_board_read.dto;

import java.util.List;

public record StudentBoardReadResponse(
	List<StudentBoardRowResponse> rows,
	List<PublicCheckSessionSummaryResponse> sessions,
	String historyPeriod
) {}
