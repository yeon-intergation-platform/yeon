package world.yeon.backend.chat_service_reports.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
import world.yeon.backend.chat_service_reports.dto.ChatServiceCreateReportResponse;
import world.yeon.backend.chat_service_reports.dto.ChatServiceReportResponse;
import world.yeon.backend.chat_service_reports.service.ChatServiceReportService;
import world.yeon.backend.chat_service_reports.service.ChatServiceReportServiceException;

@WebMvcTest(ChatServiceReportController.class)
@ActiveProfiles("jdbc")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class ChatServiceReportControllerTests {
	private static final UUID CURRENT_PROFILE_ID = UUID.fromString("11111111-1111-4111-8111-111111111111");
	@Autowired private MockMvc mockMvc;
	@MockitoBean private ChatServiceReportService service;

	@Test void 신고응답을반환한다() throws Exception {
		when(service.create(eq(CURRENT_PROFILE_ID), eq("profile"), eq("22222222-2222-4222-8222-222222222222"), eq("사유"))).thenReturn(
			new ChatServiceCreateReportResponse(new ChatServiceReportResponse("33333333-3333-4333-8333-333333333333", "profile", "22222222-2222-4222-8222-222222222222", "사유", "received", "2026-05-01T00:00Z"))
		);
		mockMvc.perform(post("/chat-service/reports")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"targetType\":\"profile\",\"targetId\":\"22222222-2222-4222-8222-222222222222\",\"reason\":\"사유\"}")
				.header("X-Yeon-Chat-Profile-Id", CURRENT_PROFILE_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.report.id").value("33333333-3333-4333-8333-333333333333"));
	}

	@Test void 서비스오류를반환한다() throws Exception {
		when(service.create(eq(CURRENT_PROFILE_ID), eq("profile"), eq("22222222-2222-4222-8222-222222222222"), eq("사유"))).thenThrow(
			new ChatServiceReportServiceException(404, "CHAT_SERVICE_REPORT_PROFILE_NOT_FOUND", "신고 대상 프로필을 찾지 못했습니다.")
		);
		mockMvc.perform(post("/chat-service/reports")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"targetType\":\"profile\",\"targetId\":\"22222222-2222-4222-8222-222222222222\",\"reason\":\"사유\"}")
				.header("X-Yeon-Chat-Profile-Id", CURRENT_PROFILE_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isNotFound())
			.andExpect(jsonPath("$.message").value("신고 대상 프로필을 찾지 못했습니다."));
	}
}
