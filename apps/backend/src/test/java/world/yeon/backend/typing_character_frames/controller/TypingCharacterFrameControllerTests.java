package world.yeon.backend.typing_character_frames.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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
import world.yeon.backend.typing_character_frames.dto.*;
import world.yeon.backend.typing_character_frames.service.TypingCharacterFrameService;
import world.yeon.backend.typing_character_frames.service.TypingCharacterFrameServiceException;

@WebMvcTest(TypingCharacterFrameController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class TypingCharacterFrameControllerTests {
	private static final UUID ADMIN_ID = UUID.fromString("00000000-0000-0000-0000-000000000701");

	@Autowired private MockMvc mockMvc;
	@MockitoBean private TypingCharacterFrameService service;

	@Test void 목록응답을반환한다() throws Exception {
		when(service.listOverrides()).thenReturn(new TypingCharacterFrameOverrideListResponse(List.of(
			new TypingCharacterFrameOverrideResponse("hero", List.of(new TypingCharacterFrameSlotResponse(1, true)))
		)));

		mockMvc.perform(get("/typing-character-frames").header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.overrides[0].characterId").value("hero"))
			.andExpect(jsonPath("$.overrides[0].frameSlots[0].frameIdx").value(1));
	}

	@Test void 수정응답을반환한다() throws Exception {
		var request = new UpdateTypingCharacterFrameOverrideRequest(List.of(new TypingCharacterFrameSlotRequest(2, true)));
		when(service.updateOverride(eq(ADMIN_ID), eq("hero"), eq(request))).thenReturn(
			new TypingCharacterFrameOverrideMutationResponse(
				new TypingCharacterFrameOverrideResponse("hero", List.of(new TypingCharacterFrameSlotResponse(2, true)))
			)
		);

		mockMvc.perform(put("/typing-character-frames/hero")
				.header("X-Yeon-User-Id", ADMIN_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"frameSlots\":[{\"frameIdx\":2,\"enabled\":true}]}"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.override.characterId").value("hero"))
			.andExpect(jsonPath("$.override.frameSlots[0].enabled").value(true));
	}

	@Test void 삭제응답은overrideNull을반환한다() throws Exception {
		var request = new UpdateTypingCharacterFrameOverrideRequest(null);
		when(service.updateOverride(eq(ADMIN_ID), eq("hero"), eq(request))).thenReturn(new TypingCharacterFrameOverrideMutationResponse(null));

		mockMvc.perform(put("/typing-character-frames/hero")
				.header("X-Yeon-User-Id", ADMIN_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"frameSlots\":null}"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.override").doesNotExist());
	}

	@Test void 관리자오류를반환한다() throws Exception {
		var request = new UpdateTypingCharacterFrameOverrideRequest(List.of(new TypingCharacterFrameSlotRequest(2, true)));
		when(service.updateOverride(eq(ADMIN_ID), eq("hero"), eq(request))).thenThrow(new TypingCharacterFrameServiceException(403, "ADMIN_REQUIRED", "관리자 권한이 필요합니다."));

		mockMvc.perform(put("/typing-character-frames/hero")
				.header("X-Yeon-User-Id", ADMIN_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"frameSlots\":[{\"frameIdx\":2,\"enabled\":true}]}"))
			.andExpect(status().isForbidden())
			.andExpect(jsonPath("$.message").value("관리자 권한이 필요합니다."));
	}
}
