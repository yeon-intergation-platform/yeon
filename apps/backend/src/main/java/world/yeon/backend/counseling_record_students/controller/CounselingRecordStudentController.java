package world.yeon.backend.counseling_record_students.controller;

import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.counseling_record_students.dto.CounselingRecordStudentSummariesResponse;
import world.yeon.backend.counseling_record_students.service.CounselingRecordStudentService;

@RestController
@Profile("jdbc")
public class CounselingRecordStudentController {
	private final CounselingRecordStudentService service;

	public CounselingRecordStudentController(CounselingRecordStudentService service) {
		this.service = service;
	}

	@GetMapping("/counseling-records/students")
	public CounselingRecordStudentSummariesResponse getStudents(@RequestHeader("X-Yeon-User-Id") UUID userId) {
		return service.listStudentSummaries(userId);
	}
}
