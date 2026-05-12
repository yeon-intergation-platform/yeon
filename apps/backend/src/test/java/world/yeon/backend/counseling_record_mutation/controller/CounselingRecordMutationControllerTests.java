package world.yeon.backend.counseling_record_mutation.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import world.yeon.backend.counseling_record_mutation.dto.MutationOkResponse;
import world.yeon.backend.counseling_record_mutation.service.CounselingRecordMutationService;
import world.yeon.backend.counseling_record_mutation.service.CounselingRecordMutationServiceException;

@WebMvcTest(CounselingRecordMutationController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class CounselingRecordMutationControllerTests {
	private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000993");

	@Autowired private MockMvc mockMvc;
	@MockitoBean private CounselingRecordMutationService service;

	@Test void 수강생연결을반환한다() throws Exception {
		when(service.linkRecord(eq(USER_ID), eq("cr-1"), eq("mem-1"))).thenReturn(new MutationOkResponse(true));
		mockMvc.perform(
			patch("/counseling-records/cr-1/link-member")
				.header("X-Yeon-User-Id", USER_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"memberId\":\"mem-1\"}")
		)
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.ok").value(true));
	}

	@Test void 삭제를반환한다() throws Exception {
		when(service.deleteRecord(eq(USER_ID), eq("cr-1"))).thenReturn(new MutationOkResponse(true));
		mockMvc.perform(
			delete("/counseling-records/cr-1")
				.header("X-Yeon-User-Id", USER_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token")
		)
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.ok").value(true));
	}

	@Test void 서비스오류를반환한다() throws Exception {
		when(service.linkRecord(eq(USER_ID), eq("cr-missing"), eq((String) null)))
			.thenThrow(new CounselingRecordMutationServiceException(404, "COUNSELING_RECORD_NOT_FOUND", "상담 기록을 찾지 못했습니다."));
		mockMvc.perform(
			patch("/counseling-records/cr-missing/link-member")
				.header("X-Yeon-User-Id", USER_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"memberId\":null}")
		)
			.andExpect(status().isNotFound());
	}
}
