package world.yeon.backend.counseling_record_students.service;

import java.util.UUID;
import org.springframework.stereotype.Service;
import world.yeon.backend.counseling_record_students.dto.CounselingRecordStudentSummariesResponse;
import world.yeon.backend.counseling_record_students.dto.CounselingRecordStudentSummaryResponse;
import world.yeon.backend.counseling_record_students.repository.CounselingRecordStudentRepository;

@Service
public class CounselingRecordStudentService {
	private final CounselingRecordStudentRepository repository;

	public CounselingRecordStudentService(CounselingRecordStudentRepository repository) {
		this.repository = repository;
	}

	public CounselingRecordStudentSummariesResponse listStudentSummaries(UUID userId) {
		return new CounselingRecordStudentSummariesResponse(
			repository.listStudentSummaries(userId).stream()
				.map(row -> new CounselingRecordStudentSummaryResponse(
					row.studentName(),
					Math.toIntExact(row.recordCount()),
					row.firstCounselingAt().toString(),
					row.lastCounselingAt().toString()
				))
				.toList()
		);
	}
}
