package world.yeon.backend.chat_service_profiles.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import world.yeon.backend.chat_service_profiles.dto.ChatServiceGetProfileResponse;
import world.yeon.backend.chat_service_profiles.dto.ChatServicePublicProfileResponse;
import world.yeon.backend.chat_service_profiles.service.ChatServiceProfileReadService;
import world.yeon.backend.chat_service_profiles.service.ChatServiceProfileReadServiceException;

@WebMvcTest(ChatServiceProfileReadController.class)
@ActiveProfiles("jdbc")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class ChatServiceProfileReadControllerTests {
	private static final UUID CURRENT_PROFILE_ID = UUID.fromString("00000000-0000-0000-0000-000000000111");
	private static final UUID TARGET_PROFILE_ID = UUID.fromString("00000000-0000-0000-0000-000000000222");
	@Autowired private MockMvc mockMvc;
	@MockitoBean private ChatServiceProfileReadService service;

	@Test void 프로필을반환한다() throws Exception {
		when(service.getProfile(eq(CURRENT_PROFILE_ID), eq(TARGET_PROFILE_ID))).thenReturn(
			new ChatServiceGetProfileResponse(new ChatServicePublicProfileResponse(
				TARGET_PROFILE_ID.toString(), "닉네임", "20대", "서울", null, "소개", 10
			))
		);
		mockMvc.perform(get("/chat-service/profiles/" + TARGET_PROFILE_ID)
				.header("X-Yeon-Chat-Profile-Id", CURRENT_PROFILE_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.profile.id").value(TARGET_PROFILE_ID.toString()))
			.andExpect(jsonPath("$.profile.nickname").value("닉네임"));
	}

	@Test void 차단관계오류를반환한다() throws Exception {
		when(service.getProfile(eq(CURRENT_PROFILE_ID), eq(TARGET_PROFILE_ID))).thenThrow(
			new ChatServiceProfileReadServiceException(403, "CHAT_SERVICE_BLOCKED_RELATION", "차단 관계에서는 이 작업을 수행할 수 없습니다.")
		);
		mockMvc.perform(get("/chat-service/profiles/" + TARGET_PROFILE_ID)
				.header("X-Yeon-Chat-Profile-Id", CURRENT_PROFILE_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isForbidden())
			.andExpect(jsonPath("$.message").value("차단 관계에서는 이 작업을 수행할 수 없습니다."));
	}
}
