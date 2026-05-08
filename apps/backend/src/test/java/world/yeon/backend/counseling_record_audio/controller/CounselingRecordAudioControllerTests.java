package world.yeon.backend.counseling_record_audio.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import world.yeon.backend.counseling_record_audio.service.CounselingRecordAudioService;
import world.yeon.backend.counseling_record_audio.service.CounselingRecordAudioServiceException;

@WebMvcTest(CounselingRecordAudioController.class)
@ActiveProfiles("jdbc")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class CounselingRecordAudioControllerTests {
	private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000992");

	@Autowired private MockMvc mockMvc;
	@MockitoBean private CounselingRecordAudioService service;

	@Test void 상담음성파일을반환한다() throws Exception {
		when(service.getAudio(eq(USER_ID), eq("cr-1"), eq("bytes=0-4"))).thenReturn(
			new CounselingRecordAudioService.AudioResponse(
				"audio".getBytes(),
				"audio/webm",
				"상담.webm",
				5,
				"bytes 0-4/10",
				206
			)
		);

		mockMvc.perform(
			get("/counseling-records/cr-1/audio")
				.header("X-Yeon-User-Id", USER_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token")
				.header("Range", "bytes=0-4")
		)
			.andExpect(status().isPartialContent())
			.andExpect(header().string("content-type", "audio/webm"))
			.andExpect(header().string("content-range", "bytes 0-4/10"));
	}

	@Test void 상담음성서비스오류를반환한다() throws Exception {
		when(service.getAudio(eq(USER_ID), eq("cr-missing"), eq(null))).thenThrow(
			new CounselingRecordAudioServiceException(404, "COUNSELING_RECORD_NOT_FOUND", "상담 기록을 찾지 못했습니다.")
		);

		mockMvc.perform(
			get("/counseling-records/cr-missing/audio")
				.header("X-Yeon-User-Id", USER_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token")
		)
			.andExpect(status().isNotFound());
	}
}
