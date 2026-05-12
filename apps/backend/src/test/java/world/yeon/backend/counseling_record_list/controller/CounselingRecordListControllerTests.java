package world.yeon.backend.counseling_record_list.controller;

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
import world.yeon.backend.counseling_record_list.dto.CounselingRecordListItemResponse;
import world.yeon.backend.counseling_record_list.dto.CounselingRecordListResponse;
import world.yeon.backend.counseling_record_list.service.CounselingRecordListService;

@WebMvcTest(CounselingRecordListController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class CounselingRecordListControllerTests {
	private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000997");
	@Autowired private MockMvc mockMvc;
	@MockitoBean private CounselingRecordListService service;

	@Test void 상담기록목록을반환한다() throws Exception {
		when(service.listRecords(eq(USER_ID), eq(null), eq(false), eq(null), eq(null))).thenReturn(
			new CounselingRecordListResponse(List.of(
				new CounselingRecordListItemResponse(
					"cr-1", "space-1", "mem-1", "홍길동", "1회기", "대면 상담", "상담사", "ready", "audio_upload",
					"미리보기", List.of("대면 상담"), "a.m4a", "audio/m4a", 12L, 3, 1, 10, "completed", 100,
					"완료", 1, 1, 1, "ready", 100, null, 1, "ko", "gpt", null,
					"2026-05-01T00:00Z", "2026-05-01T00:00Z", null, null
				)
			))
		);
		mockMvc.perform(get("/counseling-records")
				.header("X-Yeon-User-Id", USER_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.records[0].id").value("cr-1"))
			.andExpect(jsonPath("$.records[0].spaceId").value("space-1"));
	}
}
