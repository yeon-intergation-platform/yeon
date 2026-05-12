package world.yeon.backend.counseling_record_students.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import world.yeon.backend.counseling_record_students.dto.CounselingRecordStudentSummariesResponse;
import world.yeon.backend.counseling_record_students.dto.CounselingRecordStudentSummaryResponse;
import world.yeon.backend.counseling_record_students.service.CounselingRecordStudentService;

@WebMvcTest(CounselingRecordStudentController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class CounselingRecordStudentControllerTests {
	private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000989");
	@Autowired private MockMvc mockMvc;
	@MockitoBean private CounselingRecordStudentService service;

	@Test void 학생요약목록을반환한다() throws Exception {
		when(service.listStudentSummaries(eq(USER_ID))).thenReturn(
			new CounselingRecordStudentSummariesResponse(List.of(
				new CounselingRecordStudentSummaryResponse("홍길동", 2, "2026-05-01T00:00Z", "2026-05-08T00:00Z")
			))
		);
		mockMvc.perform(get("/counseling-records/students").header("X-Yeon-User-Id", USER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.students[0].studentName").value("홍길동"))
			.andExpect(jsonPath("$.students[0].recordCount").value(2));
	}
}
