package world.yeon.backend.community_chat.dto;

public record SendCommunityChatMessageRequest(
	String body,
	String guestSessionId,
	String guestNickname,
	String senderNickname
) {}
