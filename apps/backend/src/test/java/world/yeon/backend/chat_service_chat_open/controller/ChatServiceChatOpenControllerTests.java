package world.yeon.backend.chat_service_chat_open.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.OffsetDateTime;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import world.yeon.backend.chat_service_chat_open.dto.ChatServiceOpenChatProfileSummaryResponse;
import world.yeon.backend.chat_service_chat_open.dto.ChatServiceOpenChatResponse;
import world.yeon.backend.chat_service_chat_open.dto.ChatServiceOpenChatRoomResponse;
import world.yeon.backend.chat_service_chat_open.service.ChatServiceChatOpenService;
import world.yeon.backend.chat_service_chat_open.service.ChatServiceChatOpenServiceException;

@WebMvcTest(ChatServiceChatOpenController.class)
@ActiveProfiles("jdbc")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class ChatServiceChatOpenControllerTests {
	private static final UUID CURRENT_PROFILE_ID = UUID.fromString("11111111-1111-4111-8111-111111111111");
	private static final UUID TARGET_PROFILE_ID = UUID.fromString("22222222-2222-4222-8222-222222222222");
	@Autowired private MockMvc mockMvc;
	@MockitoBean private ChatServiceChatOpenService service;

	@Test void 대화방응답을반환한다() throws Exception {
		when(service.open(eq(CURRENT_PROFILE_ID), eq(TARGET_PROFILE_ID))).thenReturn(
			new ChatServiceOpenChatResponse(
				new ChatServiceOpenChatRoomResponse(
					UUID.fromString("33333333-3333-4333-8333-333333333333"),
					new ChatServiceOpenChatProfileSummaryResponse(
						TARGET_PROFILE_ID,
						"상대",
						"20세",
						"서울",
						null,
						"소개",
						900
					),
					null,
					null,
					0,
					true
				)
			)
		);

		mockMvc.perform(post("/chat-service/chat/open")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"targetProfileId\":\"" + TARGET_PROFILE_ID + "\"}")
				.header("X-Yeon-Chat-Profile-Id", CURRENT_PROFILE_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.room.peer.nickname").value("상대"))
			.andExpect(jsonPath("$.room.unlockedByPayment").value(true));
	}

	@Test void 서비스오류를반환한다() throws Exception {
		when(service.open(eq(CURRENT_PROFILE_ID), eq(TARGET_PROFILE_ID))).thenThrow(
			new ChatServiceChatOpenServiceException(400, "CHAT_SERVICE_NOT_ENOUGH_POINTS", "포인트가 부족합니다.")
		);
		mockMvc.perform(post("/chat-service/chat/open")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"targetProfileId\":\"" + TARGET_PROFILE_ID + "\"}")
				.header("X-Yeon-Chat-Profile-Id", CURRENT_PROFILE_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.message").value("포인트가 부족합니다."));
	}
}
