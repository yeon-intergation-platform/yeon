package world.yeon.backend.chat_service_friends_overview.dto;

public record ChatServiceFriendCardResponse(
	ChatServiceProfileSummaryResponse profile,
	String status,
	String previewText
) {}
