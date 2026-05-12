package world.yeon.backend.chat_service_friends_overview.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
import world.yeon.backend.chat_service_friends_overview.dto.ChatServiceFriendCardResponse;
import world.yeon.backend.chat_service_friends_overview.dto.ChatServiceFriendsOverviewResponse;
import world.yeon.backend.chat_service_friends_overview.dto.ChatServiceProfileSummaryResponse;
import world.yeon.backend.chat_service_friends_overview.service.ChatServiceFriendsOverviewService;

@WebMvcTest(ChatServiceFriendsOverviewController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class ChatServiceFriendsOverviewControllerTests {
	private static final UUID CURRENT_PROFILE_ID = UUID.fromString("11111111-1111-4111-8111-111111111111");
	@Autowired private MockMvc mockMvc;
	@MockitoBean private ChatServiceFriendsOverviewService service;

	@Test void overview를반환한다() throws Exception {
		ChatServiceProfileSummaryResponse summary = new ChatServiceProfileSummaryResponse("22222222-2222-4222-8222-222222222222", "닉네임", "20대", "서울", null, "소개", 10);
		when(service.getOverview(eq(CURRENT_PROFILE_ID))).thenReturn(new ChatServiceFriendsOverviewResponse(
			List.of(new ChatServiceFriendCardResponse(summary, "accepted", "소개")),
			List.of(),
			List.of(),
			List.of(summary),
			List.of()
		));
		mockMvc.perform(get("/chat-service/friends/overview")
				.header("X-Yeon-Chat-Profile-Id", CURRENT_PROFILE_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.friends[0].profile.id").value("22222222-2222-4222-8222-222222222222"))
			.andExpect(jsonPath("$.suggested[0].nickname").value("닉네임"));
	}
}
