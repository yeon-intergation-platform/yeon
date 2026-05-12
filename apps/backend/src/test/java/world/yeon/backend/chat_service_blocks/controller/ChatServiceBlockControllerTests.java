package world.yeon.backend.chat_service_blocks.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
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
import world.yeon.backend.chat_service_blocks.dto.ChatServiceBlockProfilesResponse;
import world.yeon.backend.chat_service_blocks.dto.ChatServiceProfileSummaryResponse;
import world.yeon.backend.chat_service_blocks.service.ChatServiceBlockService;
import world.yeon.backend.chat_service_blocks.service.ChatServiceBlockServiceException;

@WebMvcTest(ChatServiceBlockController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class ChatServiceBlockControllerTests {
	private static final UUID CURRENT_PROFILE_ID = UUID.fromString("11111111-1111-4111-8111-111111111111");
	private static final UUID TARGET_PROFILE_ID = UUID.fromString("22222222-2222-4222-8222-222222222222");
	@Autowired private MockMvc mockMvc;
	@MockitoBean private ChatServiceBlockService service;

	@Test void 차단응답을반환한다() throws Exception {
		when(service.block(eq(CURRENT_PROFILE_ID), eq(TARGET_PROFILE_ID))).thenReturn(
			new ChatServiceBlockProfilesResponse(List.of(
				new ChatServiceProfileSummaryResponse(TARGET_PROFILE_ID.toString(), "닉네임", "20대", "서울", null, "소개", 10)
			))
		);
		mockMvc.perform(post("/chat-service/profiles/" + TARGET_PROFILE_ID + "/block")
				.header("X-Yeon-Chat-Profile-Id", CURRENT_PROFILE_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.blockedProfiles[0].id").value(TARGET_PROFILE_ID.toString()));
	}

	@Test void 차단해제응답을반환한다() throws Exception {
		when(service.unblock(eq(CURRENT_PROFILE_ID), eq(TARGET_PROFILE_ID))).thenReturn(
			new ChatServiceBlockProfilesResponse(List.of())
		);
		mockMvc.perform(delete("/chat-service/profiles/" + TARGET_PROFILE_ID + "/block")
				.header("X-Yeon-Chat-Profile-Id", CURRENT_PROFILE_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.blockedProfiles").isArray());
	}

	@Test void 서비스오류를반환한다() throws Exception {
		when(service.block(eq(CURRENT_PROFILE_ID), eq(TARGET_PROFILE_ID))).thenThrow(
			new ChatServiceBlockServiceException(404, "CHAT_SERVICE_BLOCK_TARGET_NOT_FOUND", "차단 대상 프로필을 찾지 못했습니다.")
		);
		mockMvc.perform(post("/chat-service/profiles/" + TARGET_PROFILE_ID + "/block")
				.header("X-Yeon-Chat-Profile-Id", CURRENT_PROFILE_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isNotFound())
			.andExpect(jsonPath("$.message").value("차단 대상 프로필을 찾지 못했습니다."));
	}
}
