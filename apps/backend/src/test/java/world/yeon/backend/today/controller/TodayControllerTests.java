package world.yeon.backend.today.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
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
import world.yeon.backend.today.dto.TodayDtos;
import world.yeon.backend.today.service.TodayService;

@WebMvcTest(TodayController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class TodayControllerTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000001011");
	private static final UUID TASK_ID = UUID.fromString("00000000-0000-0000-0000-000000001012");
	@Autowired private MockMvc mockMvc;
	@MockitoBean private TodayService service;

	@Test
	void 날짜별보드응답계약을반환한다() throws Exception {
		TodayDtos.Task task = task();
		when(service.getBoard(OWNER_ID, "2026-07-22")).thenReturn(
			new TodayDtos.BoardResponse(
				"2026-07-22",
				List.of(task),
				0,
				new TodayDtos.Summary(1, 0, 0, 30),
				new TodayDtos.Recommendation(task, "보통 우선순위 · 30분 안에 시작할 수 있어요.", 350),
				"2026-07-22T02:00:00Z"
			)
		);

		mockMvc.perform(get("/today/board")
			.queryParam("date", "2026-07-22")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.date").value("2026-07-22"))
			.andExpect(jsonPath("$.summary.totalCount").value(1))
			.andExpect(jsonPath("$.tasks[0].title").value("할 일"));
	}

	@Test
	void 할일생성은201과생성된서버상태를반환한다() throws Exception {
		when(service.createTask(
			eq(OWNER_ID),
			eq(new TodayDtos.CreateTaskRequest("할 일", "normal", 30, null, "2026-07-22"))
		)).thenReturn(new TodayDtos.TaskResponse(task()));

		mockMvc.perform(post("/today/tasks")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.contentType(MediaType.APPLICATION_JSON)
			.content("{\"title\":\"할 일\",\"priority\":\"normal\",\"estimatedMinutes\":30,\"categoryLabel\":null,\"plannedDate\":\"2026-07-22\"}"))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.task.id").value(TASK_ID.toString()))
			.andExpect(jsonPath("$.task.version").value(0));
	}

	@Test
	void 시간기록수정은기록순서를요청본문으로전달한다() throws Exception {
		UUID activityTypeId = UUID.fromString("00000000-0000-0000-0000-000000001013");
		TodayDtos.UpsertRecordSlotRequest request =
			new TodayDtos.UpsertRecordSlotRequest(activityTypeId, "커피 마시기", 1);
		when(service.upsertRecordSlot(OWNER_ID, "2026-07-22", 18, request))
			.thenReturn(emptyRecord());

		mockMvc.perform(put("/today/records/2026-07-22/slots/18")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.contentType(MediaType.APPLICATION_JSON)
			.content("{\"activityTypeId\":\"" + activityTypeId + "\",\"note\":\"커피 마시기\",\"entryIndex\":1}"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.slots").isArray());
	}

	@Test
	void 시간기록하나삭제는기록순서를쿼리로전달한다() throws Exception {
		when(service.deleteRecordSlot(OWNER_ID, "2026-07-22", 18, 0))
			.thenReturn(emptyRecord());

		mockMvc.perform(delete("/today/records/2026-07-22/slots/18")
			.queryParam("entryIndex", "0")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.summary.recordedHours").value(0));
	}

	private TodayDtos.RecordResponse emptyRecord() {
		List<TodayDtos.RecordSlot> slots = java.util.stream.IntStream.range(0, 24)
			.mapToObj(hour -> new TodayDtos.RecordSlot(hour, null, null, List.of()))
			.toList();
		return new TodayDtos.RecordResponse(
			"2026-07-22",
			slots,
			new TodayDtos.RecordSummary(0, 0, java.util.Map.of())
		);
	}

	private TodayDtos.Task task() {
		return new TodayDtos.Task(
			TASK_ID,
			"할 일",
			"normal",
			30,
			null,
			"planned",
			"2026-07-22",
			null,
			0,
			"2026-07-22T01:00:00Z",
			"2026-07-22T01:00:00Z"
		);
	}
}
