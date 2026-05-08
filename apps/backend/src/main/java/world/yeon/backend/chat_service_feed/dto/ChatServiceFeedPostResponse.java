package world.yeon.backend.chat_service_feed.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ChatServiceFeedPostResponse(
	UUID id,
	String body,
	UUID replyToPostId,
	int replyCount,
	ChatServiceFeedProfileSummaryResponse author,
	OffsetDateTime createdAt
) {}
