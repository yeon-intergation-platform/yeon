package world.yeon.backend.student_board_history.dto;

import java.util.List;

public record MemberStudentBoardHistoryResponse(
	String period,
	List<StudentBoardDailyCellResponse> dailyCells,
	List<StudentBoardHistoryItemResponse> history
) {}
