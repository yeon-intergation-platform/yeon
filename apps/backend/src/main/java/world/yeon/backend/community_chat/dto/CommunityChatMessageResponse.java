package world.yeon.backend.community_chat.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record CommunityChatMessageResponse(
	UUID id,
	String senderId,
	String senderNickname,
	String body,
	OffsetDateTime createdAt
) {}
