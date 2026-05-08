package world.yeon.backend.counseling_record_details.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
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
import world.yeon.backend.counseling_record_details.dto.CounselingRecordAssistantMessageResponse;
import world.yeon.backend.counseling_record_details.dto.CounselingRecordDetailItemResponse;
import world.yeon.backend.counseling_record_details.dto.CounselingRecordDetailsResponse;
import world.yeon.backend.counseling_record_details.dto.CounselingRecordTranscriptSegmentResponse;
import world.yeon.backend.counseling_record_details.service.CounselingRecordDetailService;
import world.yeon.backend.counseling_record_details.service.CounselingRecordDetailServiceException;

@WebMvcTest(CounselingRecordDetailController.class)
@ActiveProfiles("jdbc")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class CounselingRecordDetailControllerTests {
	private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000991");

	@Autowired private MockMvc mockMvc;
	@MockitoBean private CounselingRecordDetailService service;

	@Test void 상담기록상세목록을반환한다() throws Exception {
		ObjectNode analysis = JsonNodeFactory.instance.objectNode();
		analysis.put("summary", "요약");

		when(service.getDetails(eq(USER_ID), eq(List.of("cr-1")))).thenReturn(
			new CounselingRecordDetailsResponse(List.of(
				new CounselingRecordDetailItemResponse(
					"cr-1", "space-1", "mem-1", "홍길동", "1회기", "대면 상담", "상담사", "ready", "audio_upload",
					"미리보기", List.of("대면 상담"), "a.m4a", "audio/m4a", 128, 1200, 1, 5,
					"completed", 100, "완료", 1, 1, 1, "ready", 100, null, 1, "ko", "gpt", null,
					"2026-05-01T00:00Z", "2026-05-01T00:00Z", null, null, "원문",
					List.of(new CounselingRecordTranscriptSegmentResponse("11111111-1111-4111-8111-111111111111", 0, 0, 1000, "멘토", "teacher", "안녕")),
					"/api/v1/counseling-records/cr-1/audio",
					analysis,
					List.of(new CounselingRecordAssistantMessageResponse("msg-1", "assistant", "도움말", "2026-05-01T00:00Z"))
				)
			))
		);

		mockMvc.perform(
			post("/counseling-records/details")
				.header("X-Yeon-User-Id", USER_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"recordIds\":[\"cr-1\"]}")
		)
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.records[0].id").value("cr-1"))
			.andExpect(jsonPath("$.records[0].transcriptSegments[0].speakerTone").value("teacher"))
			.andExpect(jsonPath("$.records[0].assistantMessages[0].role").value("assistant"));
	}

	@Test void 추이분석용기록목록을반환한다() throws Exception {
		when(service.getTrendSources(eq(USER_ID), eq(List.of("cr-1")))).thenReturn(
			new world.yeon.backend.counseling_record_details.dto.CounselingRecordTrendSourcesResponse(List.of(
				new world.yeon.backend.counseling_record_details.dto.CounselingRecordTrendSourceItemResponse(
					"홍길동",
					"1회기",
					"대면 상담",
					"2026-05-01T00:00Z",
					List.of(new world.yeon.backend.counseling_record_details.dto.CounselingRecordTrendSegmentResponse("멘토", "안녕", 0))
				)
			))
		);

		mockMvc.perform(
			post("/counseling-records/trend-source")
				.header("X-Yeon-User-Id", USER_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"recordIds\":[\"cr-1\"]}")
		)
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.records[0].studentName").value("홍길동"))
			.andExpect(jsonPath("$.records[0].segments[0].speakerLabel").value("멘토"));
	}

	@Test void 단일상담기록상세를반환한다() throws Exception {
		ObjectNode analysis = JsonNodeFactory.instance.objectNode();
		analysis.put("summary", "요약");

		when(service.getDetail(eq(USER_ID), eq("cr-1"))).thenReturn(
			new CounselingRecordDetailItemResponse(
				"cr-1", "space-1", "mem-1", "홍길동", "1회기", "대면 상담", "상담사", "ready", "audio_upload",
				"미리보기", List.of("대면 상담"), "a.m4a", "audio/m4a", 128, 1200, 1, 5,
				"completed", 100, "완료", 1, 1, 1, "ready", 100, null, 1, "ko", "gpt", null,
				"2026-05-01T00:00Z", "2026-05-01T00:00Z", null, null, "원문",
				List.of(new CounselingRecordTranscriptSegmentResponse("11111111-1111-4111-8111-111111111111", 0, 0, 1000, "멘토", "teacher", "안녕")),
				"/api/v1/counseling-records/cr-1/audio",
				analysis,
				List.of()
			)
		);

		mockMvc.perform(get("/counseling-records/cr-1").header("X-Yeon-User-Id", USER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.record.id").value("cr-1"))
			.andExpect(jsonPath("$.record.transcriptSegments[0].speakerTone").value("teacher"));
	}

	@Test void 단일상담기록상세서비스오류를반환한다() throws Exception {
		when(service.getDetail(eq(USER_ID), eq("cr-missing"))).thenThrow(
			new CounselingRecordDetailServiceException(404, "COUNSELING_RECORD_NOT_FOUND", "상담 기록을 찾지 못했습니다.")
		);

		mockMvc.perform(get("/counseling-records/cr-missing").header("X-Yeon-User-Id", USER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isNotFound())
			.andExpect(jsonPath("$.message").value("상담 기록을 찾지 못했습니다."));
	}
}
