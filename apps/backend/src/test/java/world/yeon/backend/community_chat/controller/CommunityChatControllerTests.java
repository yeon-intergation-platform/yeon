package world.yeon.backend.community_chat.controller;

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
import world.yeon.backend.community_chat.dto.*;
import world.yeon.backend.community_chat.service.CommunityChatService;
import world.yeon.backend.community_chat.service.CommunityChatServiceException;

@WebMvcTest(CommunityChatController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class CommunityChatControllerTests {
	private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000801");
	private static final UUID MESSAGE_ID = UUID.fromString("00000000-0000-0000-0000-000000000802");
	private static final OffsetDateTime CREATED_AT = OffsetDateTime.parse("2026-05-12T11:30:00Z");

	@Autowired private MockMvc mockMvc;
	@MockitoBean private CommunityChatService service;

	@Test void 공개채팅목록을반환한다() throws Exception {
		when(service.listMessages()).thenReturn(new CommunityChatMessagesResponse(List.of(
			new CommunityChatMessageResponse(MESSAGE_ID, "guest:presence-1", "익명이", "안녕", CREATED_AT)
		)));

		mockMvc.perform(get("/api/v1/community-chat/messages").header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.messages[0].senderNickname").value("익명이"))
			.andExpect(jsonPath("$.messages[0].body").value("안녕"));
	}

	@Test void 비회원메시지를전송한다() throws Exception {
		var request = new SendCommunityChatMessageRequest("안녕", "presence-1", "익명이", "익명이");
		when(service.send(isNull(), eq(request))).thenReturn(new CommunityChatMessageMutationResponse(
			new CommunityChatMessageResponse(MESSAGE_ID, "guest:presence-1", "익명이", "안녕", CREATED_AT)
		));

		mockMvc.perform(post("/api/v1/community-chat/messages")
				.header("X-Yeon-Internal-Token", "test-internal-token")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"body\":\"안녕\",\"guestSessionId\":\"presence-1\",\"guestNickname\":\"익명이\",\"senderNickname\":\"익명이\"}"))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.message.senderId").value("guest:presence-1"));
	}

	@Test void 로그인사용자메시지를전송한다() throws Exception {
		var request = new SendCommunityChatMessageRequest("안녕", null, null, "현준");
		when(service.send(eq(USER_ID), eq(request))).thenReturn(new CommunityChatMessageMutationResponse(
			new CommunityChatMessageResponse(MESSAGE_ID, "user:" + USER_ID, "현준", "안녕", CREATED_AT)
		));

		mockMvc.perform(post("/api/v1/community-chat/messages")
				.header("X-Yeon-Internal-Token", "test-internal-token")
				.header("X-Yeon-User-Id", USER_ID.toString())
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"body\":\"안녕\",\"senderNickname\":\"현준\"}"))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.message.senderId").value("user:" + USER_ID));
	}

	@Test void 서비스오류를반환한다() throws Exception {
		var request = new SendCommunityChatMessageRequest("", "presence-1", "익명이", "익명이");
		when(service.send(isNull(), eq(request))).thenThrow(new CommunityChatServiceException(400, "COMMUNITY_CHAT_INVALID", "메시지를 입력해 주세요."));

		mockMvc.perform(post("/api/v1/community-chat/messages")
				.header("X-Yeon-Internal-Token", "test-internal-token")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"body\":\"\",\"guestSessionId\":\"presence-1\",\"guestNickname\":\"익명이\",\"senderNickname\":\"익명이\"}"))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.message").value("메시지를 입력해 주세요."));
	}
}
