package world.yeon.backend.chat_service_friends_overview.dto;

import java.util.List;

public record ChatServiceFriendsOverviewResponse(
	List<ChatServiceFriendCardResponse> friends,
	List<ChatServiceFriendCardResponse> pendingSent,
	List<ChatServiceFriendCardResponse> pendingReceived,
	List<ChatServiceProfileSummaryResponse> suggested,
	List<ChatServiceProfileSummaryResponse> blocked
) {}
