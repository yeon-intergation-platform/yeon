package world.yeon.backend.chat_service_chat_rooms.controller;

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
import world.yeon.backend.chat_service_chat_rooms.dto.ChatServiceChatMessageMutationResponse;
import world.yeon.backend.chat_service_chat_rooms.dto.ChatServiceChatMessageResponse;
import world.yeon.backend.chat_service_chat_rooms.dto.ChatServiceChatRoomDetailResponse;
import world.yeon.backend.chat_service_chat_rooms.dto.ChatServiceChatRoomListResponse;
import world.yeon.backend.chat_service_chat_rooms.dto.ChatServiceChatRoomProfileSummaryResponse;
import world.yeon.backend.chat_service_chat_rooms.dto.ChatServiceChatRoomResponse;
import world.yeon.backend.chat_service_chat_rooms.service.ChatServiceChatRoomsService;
import world.yeon.backend.chat_service_chat_rooms.service.ChatServiceChatRoomsServiceException;

@WebMvcTest(ChatServiceChatRoomsController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class ChatServiceChatRoomsControllerTests {
	private static final UUID CURRENT_PROFILE_ID = UUID.fromString("11111111-1111-4111-8111-111111111111");
	private static final UUID ROOM_ID = UUID.fromString("33333333-3333-4333-8333-333333333333");
	@Autowired private MockMvc mockMvc;
	@MockitoBean private ChatServiceChatRoomsService service;

	@Test void 대화방목록응답을반환한다() throws Exception {
		when(service.list(eq(CURRENT_PROFILE_ID))).thenReturn(new ChatServiceChatRoomListResponse(List.of(sampleRoom())));
		mockMvc.perform(get("/chat-service/chat/rooms")
				.header("X-Yeon-Chat-Profile-Id", CURRENT_PROFILE_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.rooms[0].peer.nickname").value("상대"));
	}

	@Test void 대화방상세응답을반환한다() throws Exception {
		when(service.get(eq(CURRENT_PROFILE_ID), eq(ROOM_ID))).thenReturn(new ChatServiceChatRoomDetailResponse(sampleRoom(), List.of(sampleMessage())));
		mockMvc.perform(get("/chat-service/chat/rooms/{roomId}", ROOM_ID)
				.header("X-Yeon-Chat-Profile-Id", CURRENT_PROFILE_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.messages[0].body").value("안녕"));
	}

	@Test void 메시지전송응답을반환한다() throws Exception {
		when(service.send(eq(CURRENT_PROFILE_ID), eq(ROOM_ID), eq("안녕"))).thenReturn(new ChatServiceChatMessageMutationResponse(sampleMessage()));
		mockMvc.perform(post("/chat-service/chat/rooms/{roomId}/messages", ROOM_ID)
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"body\":\"안녕\"}")
				.header("X-Yeon-Chat-Profile-Id", CURRENT_PROFILE_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.message.body").value("안녕"));
	}

	@Test void 서비스오류를반환한다() throws Exception {
		when(service.get(eq(CURRENT_PROFILE_ID), eq(ROOM_ID))).thenThrow(
			new ChatServiceChatRoomsServiceException(403, "CHAT_SERVICE_BLOCKED_RELATION", "차단 관계에서는 이 작업을 수행할 수 없습니다.")
		);
		mockMvc.perform(get("/chat-service/chat/rooms/{roomId}", ROOM_ID)
				.header("X-Yeon-Chat-Profile-Id", CURRENT_PROFILE_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isForbidden())
			.andExpect(jsonPath("$.message").value("차단 관계에서는 이 작업을 수행할 수 없습니다."));
	}

	private ChatServiceChatRoomResponse sampleRoom() {
		return new ChatServiceChatRoomResponse(
			ROOM_ID,
			new ChatServiceChatRoomProfileSummaryResponse(
				UUID.fromString("22222222-2222-4222-8222-222222222222"),
				"상대",
				"20세",
				"서울",
				null,
				"소개",
				900
			),
			"안녕",
			OffsetDateTime.parse("2026-05-08T10:00:00Z"),
			0,
			true
		);
	}

	private ChatServiceChatMessageResponse sampleMessage() {
		return new ChatServiceChatMessageResponse(
			UUID.fromString("44444444-4444-4444-8444-444444444444"),
			ROOM_ID,
			CURRENT_PROFILE_ID,
			"안녕",
			OffsetDateTime.parse("2026-05-08T10:00:00Z")
		);
	}
}
