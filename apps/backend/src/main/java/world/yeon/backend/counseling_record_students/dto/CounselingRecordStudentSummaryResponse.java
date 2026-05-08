package world.yeon.backend.counseling_record_students.dto;

public record CounselingRecordStudentSummaryResponse(
	String studentName,
	int recordCount,
	String firstCounselingAt,
	String lastCounselingAt
) {}
