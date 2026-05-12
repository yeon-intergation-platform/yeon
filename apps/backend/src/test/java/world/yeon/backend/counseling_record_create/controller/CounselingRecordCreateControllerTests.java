package world.yeon.backend.counseling_record_create.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import world.yeon.backend.counseling_record_create.service.CounselingRecordCreateService;
import world.yeon.backend.counseling_record_create.service.CounselingRecordCreateServiceException;
import world.yeon.backend.counseling_record_details.dto.CounselingRecordDetailItemResponse;

@WebMvcTest(CounselingRecordCreateController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class CounselingRecordCreateControllerTests {
	private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000995");

	@Autowired private MockMvc mockMvc;
	@MockitoBean private CounselingRecordCreateService service;

	@Test void 상담음성기록을생성한다() throws Exception {
		when(service.create(any())).thenReturn(recordResponse("cr-1", "processing", "audio_upload"));
		MockMultipartFile audio = new MockMultipartFile("audio", "voice.webm", "audio/webm", "audio".getBytes(StandardCharsets.UTF_8));

		mockMvc.perform(
			multipart("/counseling-records")
				.file(audio)
				.param("sessionTitle", "상담")
				.header("X-Yeon-User-Id", USER_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token")
		)
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.record.id").value("cr-1"));
	}

	@Test void 텍스트메모를생성한다() throws Exception {
		when(service.create(any())).thenReturn(recordResponse("cr-text", "ready", "text_memo"));

		mockMvc.perform(
			multipart("/counseling-records")
				.param("recordType", "text_memo")
				.param("sessionTitle", "메모")
				.param("content", "내용")
				.header("X-Yeon-User-Id", USER_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token")
		)
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.record.recordSource").value("text_memo"));
	}

	@Test void 서비스오류를반환한다() throws Exception {
		when(service.create(any())).thenThrow(new CounselingRecordCreateServiceException(400, "AUDIO_FILE_REQUIRED", "업로드할 음성 파일이 필요합니다."));

		mockMvc.perform(
			multipart("/counseling-records")
				.header("X-Yeon-User-Id", USER_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token")
		)
			.andExpect(status().isBadRequest());
	}

	private CounselingRecordDetailItemResponse recordResponse(String id, String status, String source) {
		return new CounselingRecordDetailItemResponse(
			id,
			null,
			null,
			"수강생",
			"상담",
			"대면 상담",
			"멘토",
			status,
			source,
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
			0,
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
			null,
			null,
			List.of()
		);
	}
}
