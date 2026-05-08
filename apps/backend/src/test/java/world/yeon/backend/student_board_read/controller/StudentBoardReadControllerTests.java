package world.yeon.backend.student_board_read.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import world.yeon.backend.student_board_read.dto.PublicCheckSessionSummaryResponse;
import world.yeon.backend.student_board_read.dto.StudentBoardDailyCellResponse;
import world.yeon.backend.student_board_read.dto.StudentBoardReadResponse;
import world.yeon.backend.student_board_read.dto.StudentBoardRowResponse;
import world.yeon.backend.student_board_read.service.StudentBoardReadService;

@WebMvcTest(StudentBoardReadController.class)
@ActiveProfiles("jdbc")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class StudentBoardReadControllerTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000952");
	@Autowired private MockMvc mockMvc;
	@MockitoBean private StudentBoardReadService service;

	@Test void get응답shape를반환한다() throws Exception {
		when(service.getBoard(eq("space_alpha"), eq(OWNER_ID), eq("30d"))).thenReturn(new StudentBoardReadResponse(
			List.of(new StudentBoardRowResponse(
				"mem_1",
				"present",
				OffsetDateTime.parse("2026-05-08T01:00:00Z"),
				"manual",
				"done",
				null,
				OffsetDateTime.parse("2026-05-08T01:00:00Z"),
				"manual",
				OffsetDateTime.parse("2026-05-08T01:00:00Z"),
				true,
				List.of(new StudentBoardDailyCellResponse("2026-05-08", "present", "done", null, "2026-05-08T01:00:00Z", "manual"))
			)),
			List.of(new PublicCheckSessionSummaryResponse("pcs_1", "체크인", "active", "attendance_and_assignment", List.of("qr"), "/check/token123", null, null, null, null, OffsetDateTime.parse("2026-05-08T07:00:00Z"))),
			"30d"
		));
		mockMvc.perform(get("/spaces/space_alpha/student-board")
				.header("X-Yeon-User-Id", OWNER_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token")
				.param("historyPeriod", "30d"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.rows[0].memberId").value("mem_1"))
			.andExpect(jsonPath("$.sessions[0].id").value("pcs_1"))
			.andExpect(jsonPath("$.historyPeriod").value("30d"));
	}
}
