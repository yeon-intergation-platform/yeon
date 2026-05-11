package world.yeon.backend.chat_service_auth.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.OffsetDateTime;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import world.yeon.backend.chat_service_auth.dto.*;
import world.yeon.backend.chat_service_auth.service.ChatServiceAuthService;
import world.yeon.backend.chat_service_auth.service.ChatServiceAuthServiceException;

@WebMvcTest(ChatServiceAuthController.class)
@ActiveProfiles("jdbc")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class ChatServiceAuthControllerTests {
	@Autowired MockMvc mockMvc;
	@MockitoBean ChatServiceAuthService service;

	@Test void otp요청응답을반환한다() throws Exception {
		when(service.requestOtp(eq("01012345678"))).thenReturn(new ChatServiceRequestOtpResponse(UUID.fromString("11111111-1111-4111-8111-111111111111"), OffsetDateTime.parse("2026-05-08T10:00:00Z"), true, null));
		mockMvc.perform(post("/chat-service/auth/request-otp").contentType("application/json").content("{\"phoneNumber\":\"01012345678\"}").header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.acceptAnyCode").value(true));
	}

	@Test void otp검증응답을반환한다() throws Exception {
		when(service.verifyOtp(any(), eq("01012345678"), eq("123456"))).thenReturn(new ChatServiceVerifyOtpResponse(new ChatServiceSessionResponse("token", OffsetDateTime.parse("2026-05-08T10:00:00Z"), new ChatServiceSessionUserResponse(UUID.fromString("11111111-1111-4111-8111-111111111111"), "닉", "20세", "서울", null, "소개", 900))));
		mockMvc.perform(post("/chat-service/auth/verify-otp").contentType("application/json").content("{\"challengeId\":\"11111111-1111-4111-8111-111111111111\",\"phoneNumber\":\"01012345678\",\"code\":\"123456\"}").header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.session.token").value("token"));
	}

	@Test void session응답을반환한다() throws Exception {
		when(service.getSession(eq("token"))).thenReturn(new ChatServiceSessionStateResponse(true, new ChatServiceSessionResponse("token", OffsetDateTime.parse("2026-05-08T10:00:00Z"), new ChatServiceSessionUserResponse(UUID.fromString("11111111-1111-4111-8111-111111111111"), "닉", "20세", "서울", null, "소개", 900))));
		mockMvc.perform(get("/chat-service/auth/session").header("X-Yeon-Chat-Session-Token", "token").header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.authenticated").value(true));
	}

	@Test void 서비스오류를반환한다() throws Exception {
		when(service.requestOtp(eq("01012345678"))).thenThrow(new ChatServiceAuthServiceException(400, "CHAT_SERVICE_PHONE_INVALID", "전화번호 형식이 올바르지 않습니다."));
		mockMvc.perform(post("/chat-service/auth/request-otp").contentType("application/json").content("{\"phoneNumber\":\"01012345678\"}").header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.message").value("전화번호 형식이 올바르지 않습니다."));
	}
}
