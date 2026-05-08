package world.yeon.backend.life_os.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.LinkedHashMap;
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
import world.yeon.backend.life_os.dto.*;
import world.yeon.backend.life_os.service.LifeOsService;

@WebMvcTest(LifeOsController.class)
@ActiveProfiles("jdbc")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class LifeOsControllerTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000941");
	@Autowired private MockMvc mockMvc;
	@MockitoBean private LifeOsService service;

	@Test void days목록응답shape를반환한다() throws Exception {
		when(service.listDays(eq(OWNER_ID))).thenReturn(new GetLifeOsDaysResponse(List.of(
			new LifeOsDayDto("lod_1", "2026-05-08", "Asia/Seoul", "", "", List.of(new LifeOsHourEntryDto(0, "", "", null, null, "")), "2026-05-08T07:00:00Z", "2026-05-08T07:00:00Z")
		)));
		mockMvc.perform(get("/life-os/days").header("X-Yeon-User-Id", OWNER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.days[0].localDate").value("2026-05-08"));
	}

	@Test void day생성응답shape를반환한다() throws Exception {
		when(service.upsertDay(eq(OWNER_ID), eq(new UpsertLifeOsDayRequest("2026-05-08", "Asia/Seoul", "", "", List.of()))))
			.thenReturn(new GetLifeOsDayResponse(new LifeOsDayDto("lod_1", "2026-05-08", "Asia/Seoul", "", "", List.of(new LifeOsHourEntryDto(0, "", "", null, null, "")), "2026-05-08T07:00:00Z", "2026-05-08T07:00:00Z")));
		mockMvc.perform(post("/life-os/days").header("X-Yeon-User-Id", OWNER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token").contentType(MediaType.APPLICATION_JSON).content("{\"localDate\":\"2026-05-08\",\"timezone\":\"Asia/Seoul\",\"mindset\":\"\",\"backlogText\":\"\",\"entries\":[]}"))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.day.id").value("lod_1"));
	}

	@Test void 일간리포트응답shape를반환한다() throws Exception {
		Map<String, Object> dailyReport = new LinkedHashMap<>();
		dailyReport.put("periodType", "daily");
		dailyReport.put("periodStart", "2026-05-08");
		dailyReport.put("periodEnd", "2026-05-08");
		Map<String, Object> dailyMetrics = new LinkedHashMap<>();
		dailyMetrics.put("localDate", "2026-05-08");
		dailyMetrics.put("plannedHours", 1);
		dailyMetrics.put("actionHours", 1);
		dailyMetrics.put("matchedHours", 1);
		dailyMetrics.put("overplannedHours", 0);
		dailyMetrics.put("restInsteadOfPlanHours", 0);
		dailyMetrics.put("unrelatedActionHours", 0);
		dailyMetrics.put("spilloverHours", 0);
		dailyMetrics.put("overplanningScore", 0);
		dailyMetrics.put("mismatchByBlock", Map.of("0-7", 0, "8-15", 0, "16-23", 0));
		dailyMetrics.put("classifications", List.of());
		dailyReport.put("metrics", dailyMetrics);
		dailyReport.put("patterns", List.of());
		dailyReport.put("recommendations", List.of());
		dailyReport.put("generatedAt", "2026-05-08T07:00:00Z");
		dailyReport.put("aiSummary", null);
		when(service.buildDailyReport(eq(OWNER_ID), eq("2026-05-08"))).thenReturn(new LifeOsReportResponse(dailyReport));
		mockMvc.perform(get("/life-os/reports/daily").queryParam("localDate", "2026-05-08").header("X-Yeon-User-Id", OWNER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.report.periodType").value("daily"));
	}

	@Test void 주간리포트응답shape를반환한다() throws Exception {
		Map<String, Object> weeklyReport = new LinkedHashMap<>();
		weeklyReport.put("periodType", "weekly");
		weeklyReport.put("periodStart", "2026-05-05");
		weeklyReport.put("periodEnd", "2026-05-11");
		Map<String, Object> weeklyMetrics = new LinkedHashMap<>();
		weeklyMetrics.put("periodStart", "2026-05-05");
		weeklyMetrics.put("periodEnd", "2026-05-11");
		weeklyMetrics.put("days", List.of());
		weeklyMetrics.put("plannedHours", 1);
		weeklyMetrics.put("actionHours", 1);
		weeklyMetrics.put("matchedHours", 1);
		weeklyMetrics.put("overplannedHours", 0);
		weeklyMetrics.put("overplanningScore", 0);
		weeklyReport.put("metrics", weeklyMetrics);
		weeklyReport.put("patterns", List.of());
		weeklyReport.put("recommendations", List.of());
		weeklyReport.put("generatedAt", "2026-05-08T07:00:00Z");
		weeklyReport.put("aiSummary", null);
		when(service.buildWeeklyReport(eq(OWNER_ID), eq("2026-05-05"), eq("2026-05-11"))).thenReturn(new LifeOsReportResponse(weeklyReport));
		mockMvc.perform(get("/life-os/reports/weekly").queryParam("periodStart", "2026-05-05").queryParam("periodEnd", "2026-05-11").header("X-Yeon-User-Id", OWNER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.report.periodType").value("weekly"));
	}

	@Test void day수정은pathDate를우선한다() throws Exception {
		when(service.upsertDay(eq(OWNER_ID), eq(new UpsertLifeOsDayRequest("2026-05-09", "Asia/Seoul", "", "", List.of()))))
			.thenReturn(new GetLifeOsDayResponse(new LifeOsDayDto("lod_1", "2026-05-09", "Asia/Seoul", "", "", List.of(new LifeOsHourEntryDto(0, "", "", null, null, "")), "2026-05-08T07:00:00Z", "2026-05-08T07:00:00Z")));
		mockMvc.perform(put("/life-os/days/2026-05-09").header("X-Yeon-User-Id", OWNER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token").contentType(MediaType.APPLICATION_JSON).content("{\"localDate\":\"2026-05-08\",\"timezone\":\"Asia/Seoul\",\"mindset\":\"\",\"backlogText\":\"\",\"entries\":[]}"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.day.localDate").value("2026-05-09"));
	}
}
