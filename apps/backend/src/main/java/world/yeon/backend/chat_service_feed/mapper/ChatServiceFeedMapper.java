package world.yeon.backend.chat_service_feed.mapper;

import java.util.List;
import java.util.Map;
import java.util.Set;
import world.yeon.backend.chat_service_feed.dto.ChatServiceFeedListResponse;
import world.yeon.backend.chat_service_feed.dto.ChatServiceFeedMutationResponse;
import world.yeon.backend.chat_service_feed.dto.ChatServiceFeedPostResponse;
import world.yeon.backend.chat_service_feed.dto.ChatServiceFeedProfileSummaryResponse;
import world.yeon.backend.chat_service_feed.dto.ChatServiceFeedRepliesResponse;
import world.yeon.backend.chat_service_feed.repository.ChatServiceFeedRepository;

public final class ChatServiceFeedMapper {
	private ChatServiceFeedMapper() {}

	public static ChatServiceFeedListResponse toListResponse(List<ChatServiceFeedRepository.FeedPostRow> rows, Set<java.util.UUID> blockedRelationIds, Map<java.util.UUID, Integer> replyCountMap) {
		return new ChatServiceFeedListResponse(toVisiblePosts(rows, blockedRelationIds, replyCountMap));
	}

	public static ChatServiceFeedRepliesResponse toRepliesResponse(List<ChatServiceFeedRepository.FeedPostRow> rows, Set<java.util.UUID> blockedRelationIds, Map<java.util.UUID, Integer> replyCountMap) {
		return new ChatServiceFeedRepliesResponse(toVisiblePosts(rows, blockedRelationIds, replyCountMap));
	}

	public static ChatServiceFeedMutationResponse toMutationResponse(ChatServiceFeedRepository.FeedPostRow row) {
		return toMutationResponse(row, 0);
	}

	public static ChatServiceFeedMutationResponse toMutationResponse(ChatServiceFeedRepository.FeedPostRow row, int replyCount) {
		return new ChatServiceFeedMutationResponse(toPost(row, replyCount));
	}

	private static List<ChatServiceFeedPostResponse> toVisiblePosts(List<ChatServiceFeedRepository.FeedPostRow> rows, Set<java.util.UUID> blockedRelationIds, Map<java.util.UUID, Integer> replyCountMap) {
		return rows.stream()
			.filter(row -> !blockedRelationIds.contains(row.authorId()))
			.map(row -> toPost(row, replyCountMap.getOrDefault(row.id(), 0)))
			.toList();
	}

	private static ChatServiceFeedPostResponse toPost(ChatServiceFeedRepository.FeedPostRow row, int replyCount) {
		return new ChatServiceFeedPostResponse(
			row.id(),
			row.body(),
			row.replyToPostId(),
			replyCount,
			new ChatServiceFeedProfileSummaryResponse(
				row.authorId(),
				row.authorNickname(),
				row.authorAgeLabel(),
				row.authorRegionLabel(),
				row.authorAvatarUrl(),
				row.authorBio(),
				row.authorPoints()
			),
			row.createdAt()
		);
	}
}
