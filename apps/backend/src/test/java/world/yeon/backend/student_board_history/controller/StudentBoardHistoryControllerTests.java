package world.yeon.backend.student_board_history.controller;

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
import world.yeon.backend.student_board_history.dto.MemberStudentBoardHistoryResponse;
import world.yeon.backend.student_board_history.dto.StudentBoardDailyCellResponse;
import world.yeon.backend.student_board_history.dto.StudentBoardHistoryItemResponse;
import world.yeon.backend.student_board_history.service.StudentBoardHistoryService;

@WebMvcTest(StudentBoardHistoryController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class StudentBoardHistoryControllerTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000932");
	@Autowired private MockMvc mockMvc;
	@MockitoBean private StudentBoardHistoryService service;

	@Test void 응답shape를반환한다() throws Exception {
		when(service.getMemberHistory(eq("space_alpha"), eq("mem_1"), eq(OWNER_ID), eq("30d")))
			.thenReturn(new MemberStudentBoardHistoryResponse(
				"30d",
				List.of(new StudentBoardDailyCellResponse("2026-05-08", "present", "done", null, "2026-05-08T01:00:00Z", "manual")),
				List.of(new StudentBoardHistoryItemResponse("smbh_1", "mem_1", "홍길동", "2026-05-08", "2026-05-08T01:00:00Z", "present", "done", null, "manual"))
			));
		mockMvc.perform(get("/spaces/space_alpha/members/mem_1/board-history")
				.param("period", "30d")
				.header("X-Yeon-User-Id", OWNER_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.period").value("30d"))
			.andExpect(jsonPath("$.history[0].id").value("smbh_1"));
	}
}
