package world.yeon.backend.import_commit.dto;

import java.util.List;

public record ImportCohortRequest(
	String name,
	String startDate,
	String endDate,
	List<ImportStudentRequest> students
) {}
