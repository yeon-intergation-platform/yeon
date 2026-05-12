package world.yeon.backend.chat_service_ask.controller;

import static org.mockito.ArgumentMatchers.eq;
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
import world.yeon.backend.chat_service_ask.dto.*;
import world.yeon.backend.chat_service_ask.service.ChatServiceAskService;
import world.yeon.backend.chat_service_ask.service.ChatServiceAskServiceException;

@WebMvcTest(ChatServiceAskController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class ChatServiceAskControllerTests {
	private static final UUID CURRENT_PROFILE_ID = UUID.fromString("11111111-1111-4111-8111-111111111111");
	private static final UUID POST_ID = UUID.fromString("33333333-3333-4333-8333-333333333333");
	@Autowired private MockMvc mockMvc;
	@MockitoBean private ChatServiceAskService service;

	@Test void ask목록응답을반환한다() throws Exception {
		when(service.list(eq(CURRENT_PROFILE_ID))).thenReturn(new ChatServiceAskListResponse(List.of(samplePost())));
		mockMvc.perform(get("/chat-service/ask").header("X-Yeon-Chat-Profile-Id", CURRENT_PROFILE_ID).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.posts[0].question").value("질문"));
	}

	@Test void ask생성응답을반환한다() throws Exception {
		when(service.create(eq(CURRENT_PROFILE_ID), eq("질문"), eq("question"), eq(List.of()))).thenReturn(new ChatServiceAskMutationResponse(samplePost()));
		mockMvc.perform(post("/chat-service/ask").contentType(MediaType.APPLICATION_JSON).content("{\"question\":\"질문\",\"kind\":\"question\"}").header("X-Yeon-Chat-Profile-Id", CURRENT_PROFILE_ID).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.post.question").value("질문"));
	}

	@Test void ask투표응답을반환한다() throws Exception {
		when(service.vote(eq(CURRENT_PROFILE_ID), eq(POST_ID), eq(1))).thenReturn(new ChatServiceAskMutationResponse(samplePollPost()));
		mockMvc.perform(post("/chat-service/ask/{postId}/vote", POST_ID).contentType(MediaType.APPLICATION_JSON).content("{\"optionIndex\":1}").header("X-Yeon-Chat-Profile-Id", CURRENT_PROFILE_ID).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.post.userVoteIndex").value(1));
	}

	@Test void 서비스오류를반환한다() throws Exception {
		when(service.vote(eq(CURRENT_PROFILE_ID), eq(POST_ID), eq(1))).thenThrow(new ChatServiceAskServiceException(404, "CHAT_SERVICE_ASK_POST_NOT_FOUND", "투표 글을 찾지 못했습니다."));
		mockMvc.perform(post("/chat-service/ask/{postId}/vote", POST_ID).contentType(MediaType.APPLICATION_JSON).content("{\"optionIndex\":1}").header("X-Yeon-Chat-Profile-Id", CURRENT_PROFILE_ID).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isNotFound())
			.andExpect(jsonPath("$.message").value("투표 글을 찾지 못했습니다."));
	}

	private ChatServiceAskPostResponse samplePost() {
		return new ChatServiceAskPostResponse(POST_ID, "질문", "question", List.of(), 0, null, new ChatServiceAskProfileSummaryResponse(CURRENT_PROFILE_ID, "닉", "20세", "서울", null, "소개", 900), OffsetDateTime.parse("2026-05-08T10:00:00Z"));
	}
	private ChatServiceAskPostResponse samplePollPost() {
		return new ChatServiceAskPostResponse(POST_ID, "질문", "poll", List.of(new ChatServiceAskOptionResponse(0, "A", 0), new ChatServiceAskOptionResponse(1, "B", 1)), 1, 1, new ChatServiceAskProfileSummaryResponse(CURRENT_PROFILE_ID, "닉", "20세", "서울", null, "소개", 900), OffsetDateTime.parse("2026-05-08T10:00:00Z"));
	}
}
