package world.yeon.backend.student_board_write.controller;

import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import world.yeon.backend.student_board_read.dto.StudentBoardReadResponse;
import world.yeon.backend.student_board_write.dto.UpdateStudentBoardRequest;
import world.yeon.backend.student_board_write.service.StudentBoardWriteService;

@WebMvcTest(StudentBoardWriteController.class)
@ActiveProfiles("jdbc")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class StudentBoardWriteControllerTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000962");
	@Autowired private MockMvc mockMvc;
	@MockitoBean private StudentBoardWriteService service;

	@Test void patch응답shape를반환한다() throws Exception {
		when(service.updateBoard(eq("space_alpha"), eq("mem_1"), eq(OWNER_ID), argThat(request ->
			request != null
				&& "present".equals(request.attendanceStatus())
				&& "done".equals(request.assignmentStatus())
				&& request.hasAssignmentLink()
				&& request.assignmentLink() == null
		)))
			.thenReturn(new StudentBoardReadResponse(List.of(), List.of(), "7d"));
		mockMvc.perform(patch("/spaces/space_alpha/student-board/mem_1")
				.header("X-Yeon-User-Id", OWNER_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"attendanceStatus\":\"present\",\"assignmentStatus\":\"done\",\"assignmentLink\":null}"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.historyPeriod").value("7d"));
	}
}
