package world.yeon.backend.chat_service_friends_overview.controller;

import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.chat_service_friends_overview.dto.ChatServiceFriendsOverviewResponse;
import world.yeon.backend.chat_service_friends_overview.service.ChatServiceFriendsOverviewService;

@RestController
@Profile("jdbc")
public class ChatServiceFriendsOverviewController {
	private final ChatServiceFriendsOverviewService service;

	public ChatServiceFriendsOverviewController(ChatServiceFriendsOverviewService service) {
		this.service = service;
	}

	@GetMapping("/chat-service/friends/overview")
	public ChatServiceFriendsOverviewResponse getOverview(@RequestHeader("X-Yeon-Chat-Profile-Id") UUID currentProfileId) {
		return service.getOverview(currentProfileId);
	}
}
