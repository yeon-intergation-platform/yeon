package world.yeon.backend.chat_service_my_profile.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
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
import world.yeon.backend.chat_service_my_profile.dto.*;
import world.yeon.backend.chat_service_my_profile.service.ChatServiceMyProfileService;
import world.yeon.backend.chat_service_my_profile.service.ChatServiceMyProfileServiceException;

@WebMvcTest(ChatServiceMyProfileController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class ChatServiceMyProfileControllerTests {
	private static final UUID CURRENT_PROFILE_ID = UUID.fromString("11111111-1111-4111-8111-111111111111");
	@Autowired private MockMvc mockMvc;
	@MockitoBean private ChatServiceMyProfileService service;

	@Test void 프로필응답을반환한다() throws Exception {
		when(service.get(eq(CURRENT_PROFILE_ID))).thenReturn(sampleGet());
		mockMvc.perform(get("/chat-service/profile/me").header("X-Yeon-Chat-Profile-Id", CURRENT_PROFILE_ID).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.profile.nickname").value("닉"));
	}

	@Test void 프로필수정응답을반환한다() throws Exception {
		when(service.update(eq(CURRENT_PROFILE_ID), eq("닉2"), eq("21세"), eq("부산"), eq("소개2"), eq(true))).thenReturn(sampleUpdate());
		mockMvc.perform(patch("/chat-service/profile/me").contentType("application/json").content("{\"nickname\":\"닉2\",\"ageLabel\":\"21세\",\"regionLabel\":\"부산\",\"bio\":\"소개2\",\"notificationsEnabled\":true}").header("X-Yeon-Chat-Profile-Id", CURRENT_PROFILE_ID).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.profile.nickname").value("닉2"));
	}

	@Test void 계정삭제응답을반환한다() throws Exception {
		when(service.delete(eq(CURRENT_PROFILE_ID))).thenReturn(new ChatServiceDeleteMyProfileResponse(true));
		mockMvc.perform(delete("/chat-service/profile/me").header("X-Yeon-Chat-Profile-Id", CURRENT_PROFILE_ID).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.deleted").value(true));
	}

	@Test void 서비스오류를반환한다() throws Exception {
		when(service.get(eq(CURRENT_PROFILE_ID))).thenThrow(new ChatServiceMyProfileServiceException(404, "CHAT_SERVICE_PROFILE_NOT_FOUND", "프로필을 찾지 못했습니다."));
		mockMvc.perform(get("/chat-service/profile/me").header("X-Yeon-Chat-Profile-Id", CURRENT_PROFILE_ID).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isNotFound())
			.andExpect(jsonPath("$.message").value("프로필을 찾지 못했습니다."));
	}

	private ChatServiceGetMyProfileResponse sampleGet() {
		return new ChatServiceGetMyProfileResponse(
			new ChatServiceMyProfileDetailResponse(CURRENT_PROFILE_ID, "010-12**-7890", "닉", "20세", "서울", null, "소개", 900, true),
			List.of(new ChatServiceMyProfileSummaryResponse(UUID.fromString("22222222-2222-4222-8222-222222222222"), "상대", "20세", "서울", null, "소개", 900)),
			List.of()
		);
	}
	private ChatServiceUpdateMyProfileResponse sampleUpdate() {
		return new ChatServiceUpdateMyProfileResponse(new ChatServiceMyProfileDetailResponse(CURRENT_PROFILE_ID, "010-12**-7890", "닉2", "21세", "부산", null, "소개2", 900, true));
	}
}
