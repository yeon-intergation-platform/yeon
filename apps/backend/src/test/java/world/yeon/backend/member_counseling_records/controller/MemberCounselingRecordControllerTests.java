package world.yeon.backend.member_counseling_records.controller;

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
import world.yeon.backend.member_counseling_records.dto.MemberCounselingRecordItemResponse;
import world.yeon.backend.member_counseling_records.dto.MemberCounselingRecordsResponse;
import world.yeon.backend.member_counseling_records.service.MemberCounselingRecordService;

@WebMvcTest(MemberCounselingRecordController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class MemberCounselingRecordControllerTests {
	private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000990");
	@Autowired private MockMvc mockMvc;
	@MockitoBean private MemberCounselingRecordService service;

	@Test void 수강생상담기록목록을반환한다() throws Exception {
		when(service.listByMember(eq(USER_ID), eq("mem-1"), eq(null), eq(null))).thenReturn(
			new MemberCounselingRecordsResponse(List.of(
				new MemberCounselingRecordItemResponse("cr-1", "홍길동", "상담", "일반", "상담사", "ready", "audio", "a.m4a", "audio/m4a", 10L, 1, "completed", 100, "완료", "ready", 100, null, null, "ko", "gpt", "2026-05-01T00:00Z", "2026-05-01T00:00Z", null, null, "space-1", "mem-1")
			))
		);
		mockMvc.perform(get("/spaces/space-1/members/mem-1/counseling-records").header("X-Yeon-User-Id", USER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.records[0].id").value("cr-1"));
	}
}
