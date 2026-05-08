package world.yeon.backend.activity_logs.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import world.yeon.backend.activity_logs.dto.ActivityLogResponse;
import world.yeon.backend.activity_logs.dto.CreateActivityLogRequest;
import world.yeon.backend.activity_logs.dto.CreateActivityLogResponse;
import world.yeon.backend.activity_logs.dto.GetActivityLogsResponse;
import world.yeon.backend.activity_logs.service.ActivityLogService;

@WebMvcTest(ActivityLogController.class)
@ActiveProfiles("jdbc")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class ActivityLogControllerTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000922");
	@Autowired private MockMvc mockMvc;
	@MockitoBean private ActivityLogService service;

	@Test void list응답shape를반환한다() throws Exception {
		when(service.getActivityLogs(eq("space_alpha"), eq("mem_1"), eq(OWNER_ID), eq("coaching-note"), eq(100)))
			.thenReturn(new GetActivityLogsResponse(List.of(
				new ActivityLogResponse("alg_1", "mem_1", "space_alpha", "coaching-note", null, OffsetDateTime.parse("2026-05-08T07:00:00Z"), "manual", Map.of("noteText", "메모"), OffsetDateTime.parse("2026-05-08T07:00:00Z"))
			), 1));
		mockMvc.perform(get("/spaces/space_alpha/members/mem_1/activity-logs")
				.param("type", "coaching-note")
				.param("limit", "100")
				.header("X-Yeon-User-Id", OWNER_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.logs[0].id").value("alg_1"))
			.andExpect(jsonPath("$.totalCount").value(1));
	}

	@Test void create응답shape를반환한다() throws Exception {
		when(service.createMemoLog(eq("space_alpha"), eq("mem_1"), eq(OWNER_ID), eq(new CreateActivityLogRequest("메모", "멘토"))))
			.thenReturn(new CreateActivityLogResponse(new ActivityLogResponse("alg_1", "mem_1", "space_alpha", "coaching-note", null, OffsetDateTime.parse("2026-05-08T07:00:00Z"), "manual", Map.of("noteText", "메모", "authorLabel", "멘토"), OffsetDateTime.parse("2026-05-08T07:00:00Z"))));
		mockMvc.perform(post("/spaces/space_alpha/members/mem_1/activity-logs")
				.header("X-Yeon-User-Id", OWNER_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"text\":\"메모\",\"authorLabel\":\"멘토\"}"))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.log.id").value("alg_1"));
	}
}
