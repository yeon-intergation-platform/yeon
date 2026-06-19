package world.yeon.backend.chat_service_chat_rooms.controller;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.chat_service_chat_rooms.dto.ChatServiceChatMessageMutationResponse;
import world.yeon.backend.chat_service_chat_rooms.dto.ChatServiceChatRoomDetailResponse;
import world.yeon.backend.chat_service_chat_rooms.dto.ChatServiceChatRoomListResponse;
import world.yeon.backend.chat_service_chat_rooms.service.ChatServiceChatRoomsService;

@RestController
public class ChatServiceChatRoomsController {
	private final ChatServiceChatRoomsService service;

	public ChatServiceChatRoomsController(ChatServiceChatRoomsService service) {
		this.service = service;
	}

	@GetMapping("/chat-service/chat/rooms")
	public ChatServiceChatRoomListResponse list(@RequestHeader("X-Yeon-Chat-Profile-Id") UUID currentProfileId) {
		return service.list(currentProfileId);
	}

	@GetMapping("/chat-service/chat/rooms/{roomId}")
	public ChatServiceChatRoomDetailResponse get(
		@RequestHeader("X-Yeon-Chat-Profile-Id") UUID currentProfileId,
		@PathVariable UUID roomId
	) {
		return service.get(currentProfileId, roomId);
	}

	@PostMapping("/chat-service/chat/rooms/{roomId}/messages")
	@ResponseStatus(HttpStatus.CREATED)
	public ChatServiceChatMessageMutationResponse send(
		@RequestHeader("X-Yeon-Chat-Profile-Id") UUID currentProfileId,
		@PathVariable UUID roomId,
		@RequestBody SendMessageRequest request
	) {
		return service.send(currentProfileId, roomId, request.body());
	}

	public record SendMessageRequest(String body) {}
}
