package world.yeon.backend.chat_service_feed.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.OffsetDateTime;
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
import world.yeon.backend.chat_service_feed.dto.*;
import world.yeon.backend.chat_service_feed.service.ChatServiceFeedService;
import world.yeon.backend.chat_service_feed.service.ChatServiceFeedServiceException;

@WebMvcTest(ChatServiceFeedController.class)
@ActiveProfiles("jdbc")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class ChatServiceFeedControllerTests {
	private static final UUID CURRENT_PROFILE_ID = UUID.fromString("11111111-1111-4111-8111-111111111111");
	private static final UUID POST_ID = UUID.fromString("33333333-3333-4333-8333-333333333333");
	@Autowired private MockMvc mockMvc;
	@MockitoBean private ChatServiceFeedService service;

	@Test void 피드목록응답을반환한다() throws Exception {
		when(service.list(eq(CURRENT_PROFILE_ID))).thenReturn(new ChatServiceFeedListResponse(List.of(samplePost())));
		mockMvc.perform(get("/chat-service/feed").header("X-Yeon-Chat-Profile-Id", CURRENT_PROFILE_ID).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.posts[0].body").value("본문"));
	}

	@Test void 비로그인피드목록도응답한다() throws Exception {
		when(service.list(isNull())).thenReturn(new ChatServiceFeedListResponse(List.of(samplePost())));
		mockMvc.perform(get("/chat-service/feed").header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.posts[0].body").value("본문"));
	}

	@Test void 답글목록응답을반환한다() throws Exception {
		when(service.listReplies(eq(CURRENT_PROFILE_ID), eq(POST_ID))).thenReturn(new ChatServiceFeedRepliesResponse(List.of(samplePost())));
		mockMvc.perform(get("/chat-service/feed/{postId}/replies", POST_ID).header("X-Yeon-Chat-Profile-Id", CURRENT_PROFILE_ID).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.replies[0].body").value("본문"));
	}

	@Test void 피드생성응답을반환한다() throws Exception {
		when(service.create(eq(CURRENT_PROFILE_ID), eq("본문"), eq(null))).thenReturn(new ChatServiceFeedMutationResponse(samplePost()));
		mockMvc.perform(post("/chat-service/feed").contentType(MediaType.APPLICATION_JSON).content("{\"body\":\"본문\"}").header("X-Yeon-Chat-Profile-Id", CURRENT_PROFILE_ID).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.post.body").value("본문"));
	}

	@Test void 서비스오류를반환한다() throws Exception {
		when(service.create(eq(CURRENT_PROFILE_ID), eq("본문"), eq(null))).thenThrow(new ChatServiceFeedServiceException(400, "CHAT_SERVICE_FEED_CREATE_FAILED", "피드 글을 생성하지 못했습니다."));
		mockMvc.perform(post("/chat-service/feed").contentType(MediaType.APPLICATION_JSON).content("{\"body\":\"본문\"}").header("X-Yeon-Chat-Profile-Id", CURRENT_PROFILE_ID).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.message").value("피드 글을 생성하지 못했습니다."));
	}

	private ChatServiceFeedPostResponse samplePost() {
		return new ChatServiceFeedPostResponse(POST_ID, "본문", null, 1, new ChatServiceFeedProfileSummaryResponse(CURRENT_PROFILE_ID, "닉", "20세", "서울", null, "소개", 900), OffsetDateTime.parse("2026-05-08T10:00:00Z"));
	}
}
