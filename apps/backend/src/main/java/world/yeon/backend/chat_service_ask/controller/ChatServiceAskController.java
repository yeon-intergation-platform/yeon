package world.yeon.backend.chat_service_ask.controller;

import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.chat_service_ask.dto.ChatServiceAskListResponse;
import world.yeon.backend.chat_service_ask.dto.ChatServiceAskMutationResponse;
import world.yeon.backend.chat_service_ask.service.ChatServiceAskService;

@RestController
public class ChatServiceAskController {
	private final ChatServiceAskService service;

	public ChatServiceAskController(ChatServiceAskService service) {
		this.service = service;
	}

	@GetMapping("/chat-service/ask")
	public ChatServiceAskListResponse list(@RequestHeader("X-Yeon-Chat-Profile-Id") UUID currentProfileId) {
		return service.list(currentProfileId);
	}

	@PostMapping("/chat-service/ask")
	@ResponseStatus(HttpStatus.CREATED)
	public ChatServiceAskMutationResponse create(@RequestHeader("X-Yeon-Chat-Profile-Id") UUID currentProfileId, @RequestBody CreateAskRequest request) {
		return service.create(currentProfileId, request.question(), request.kind(), request.options() == null ? List.of() : request.options().stream().map(Option::label).toList());
	}

	@PostMapping("/chat-service/ask/{postId}/vote")
	public ChatServiceAskMutationResponse vote(@RequestHeader("X-Yeon-Chat-Profile-Id") UUID currentProfileId, @PathVariable UUID postId, @RequestBody VoteRequest request) {
		return service.vote(currentProfileId, postId, request.optionIndex());
	}

	public record CreateAskRequest(String question, String kind, List<Option> options) {}
	public record Option(String label) {}
	public record VoteRequest(int optionIndex) {}
}
