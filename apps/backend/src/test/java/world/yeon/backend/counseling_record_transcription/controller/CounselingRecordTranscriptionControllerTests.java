package world.yeon.backend.counseling_record_transcription.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
import world.yeon.backend.counseling_record_details.dto.CounselingRecordDetailItemResponse;
import world.yeon.backend.counseling_record_transcription.service.CounselingRecordTranscriptionService;
import world.yeon.backend.counseling_record_transcription.service.CounselingRecordTranscriptionServiceException;

@WebMvcTest(CounselingRecordTranscriptionController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class CounselingRecordTranscriptionControllerTests {
	private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000994");

	@Autowired private MockMvc mockMvc;
	@MockitoBean private CounselingRecordTranscriptionService service;

	@Test void 상담기록재전사를요청한다() throws Exception {
		when(service.retryTranscription(eq(USER_ID), eq("cr-1"), eq("req-1"))).thenReturn(recordResponse());

		mockMvc.perform(
			post("/counseling-records/cr-1/transcribe")
				.header("X-Yeon-User-Id", USER_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token")
				.header("X-Client-Request-Id", "req-1")
		)
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.record.id").value("cr-1"));
	}

	@Test void 서비스오류를반환한다() throws Exception {
		when(service.retryTranscription(eq(USER_ID), eq("cr-text"), eq(null))).thenThrow(
			new CounselingRecordTranscriptionServiceException(400, "TEXT_MEMO_TRANSCRIPTION_UNSUPPORTED", "텍스트 메모는 재전사할 수 없습니다.")
		);

		mockMvc.perform(
			post("/counseling-records/cr-text/transcribe")
				.header("X-Yeon-User-Id", USER_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token")
		)
			.andExpect(status().isBadRequest());
	}

	private CounselingRecordDetailItemResponse recordResponse() {
		return new CounselingRecordDetailItemResponse(
			"cr-1",
			null,
			null,
			"수강생",
			"상담",
			"대면 상담",
			"멘토",
			"processing",
			"audio_upload",
			"",
			List.of("대면 상담"),
			"audio.webm",
			"audio/webm",
			10,
			null,
			0,
			0,
			"queued",
			5,
			"백그라운드 전사를 다시 준비하고 있습니다.",
			0,
			0,
			1,
			"idle",
			0,
			null,
			0,
			null,
			null,
			null,
			"2026-05-13T00:00:00Z",
			"2026-05-13T00:00:00Z",
			null,
			null,
			"",
			List.of(),
			"/api/v1/counseling-records/cr-1/audio",
			null,
			List.of()
		);
	}
}
