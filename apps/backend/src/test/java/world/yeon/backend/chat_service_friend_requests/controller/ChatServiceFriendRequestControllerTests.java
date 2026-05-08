package world.yeon.backend.chat_service_friend_requests.controller;

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
import world.yeon.backend.chat_service_friend_requests.dto.ChatServiceFriendMutationResponse;
import world.yeon.backend.chat_service_friend_requests.service.ChatServiceFriendRequestService;
import world.yeon.backend.chat_service_friend_requests.service.ChatServiceFriendRequestServiceException;

@WebMvcTest(ChatServiceFriendRequestController.class)
@ActiveProfiles("jdbc")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class ChatServiceFriendRequestControllerTests {
	private static final UUID CURRENT_PROFILE_ID = UUID.fromString("11111111-1111-4111-8111-111111111111");
	private static final UUID TARGET_PROFILE_ID = UUID.fromString("22222222-2222-4222-8222-222222222222");
	@Autowired private MockMvc mockMvc;
	@MockitoBean private ChatServiceFriendRequestService service;

	@Test void 친구요청응답을반환한다() throws Exception {
		when(service.send(eq(CURRENT_PROFILE_ID), eq(TARGET_PROFILE_ID))).thenReturn(new ChatServiceFriendMutationResponse(true));
		mockMvc.perform(post("/chat-service/friends/requests")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"targetProfileId\":\"" + TARGET_PROFILE_ID + "\"}")
				.header("X-Yeon-Chat-Profile-Id", CURRENT_PROFILE_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.ok").value(true));
	}

	@Test void 서비스오류를반환한다() throws Exception {
		when(service.send(eq(CURRENT_PROFILE_ID), eq(TARGET_PROFILE_ID))).thenThrow(
			new ChatServiceFriendRequestServiceException(404, "CHAT_SERVICE_FRIEND_TARGET_NOT_FOUND", "친구 요청 대상 프로필을 찾지 못했습니다.")
		);
		mockMvc.perform(post("/chat-service/friends/requests")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"targetProfileId\":\"" + TARGET_PROFILE_ID + "\"}")
				.header("X-Yeon-Chat-Profile-Id", CURRENT_PROFILE_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isNotFound())
			.andExpect(jsonPath("$.message").value("친구 요청 대상 프로필을 찾지 못했습니다."));
	}
}
