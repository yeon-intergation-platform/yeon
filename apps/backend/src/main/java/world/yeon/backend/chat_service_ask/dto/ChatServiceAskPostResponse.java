package world.yeon.backend.chat_service_ask.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record ChatServiceAskPostResponse(
	UUID id,
	String question,
	String kind,
	List<ChatServiceAskOptionResponse> options,
	int totalVotes,
	Integer userVoteIndex,
	ChatServiceAskProfileSummaryResponse author,
	OffsetDateTime createdAt
) {}
