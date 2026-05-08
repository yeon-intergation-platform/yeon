package world.yeon.backend.chat_service_feed.service;

import static world.yeon.backend.chat_service_feed.mapper.ChatServiceFeedMapper.toListResponse;
import static world.yeon.backend.chat_service_feed.mapper.ChatServiceFeedMapper.toMutationResponse;
import static world.yeon.backend.chat_service_feed.mapper.ChatServiceFeedMapper.toRepliesResponse;

import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.chat_service_feed.dto.ChatServiceFeedListResponse;
import world.yeon.backend.chat_service_feed.dto.ChatServiceFeedMutationResponse;
import world.yeon.backend.chat_service_feed.dto.ChatServiceFeedRepliesResponse;
import world.yeon.backend.chat_service_feed.repository.ChatServiceFeedRepository;

@Service
@Profile("jdbc")
public class ChatServiceFeedService {
	private final ChatServiceFeedRepository repository;

	public ChatServiceFeedService(ChatServiceFeedRepository repository) {
		this.repository = repository;
	}

	@Transactional(readOnly = true)
	public ChatServiceFeedListResponse list(UUID currentProfileId) {
		var blocked = repository.listBlockedRelationIds(currentProfileId);
		var rows = repository.listRootFeed();
		var replyCounts = repository.listReplyCounts(rows.stream().map(ChatServiceFeedRepository.FeedPostRow::id).toList(), blocked);
		return toListResponse(rows, blocked, replyCounts);
	}

	@Transactional(readOnly = true)
	public ChatServiceFeedRepliesResponse listReplies(UUID currentProfileId, UUID postId) {
		var blocked = repository.listBlockedRelationIds(currentProfileId);
		var rows = repository.listReplies(postId);
		var replyCounts = repository.listReplyCounts(rows.stream().map(ChatServiceFeedRepository.FeedPostRow::id).toList(), blocked);
		return toRepliesResponse(rows, blocked, replyCounts);
	}

	@Transactional
	public ChatServiceFeedMutationResponse create(UUID currentProfileId, String body, UUID replyToPostId) {
		if (replyToPostId != null) {
			var parentPost = repository.findFeedPost(replyToPostId);
			if (parentPost == null) {
				throw new ChatServiceFeedServiceException(404, "CHAT_SERVICE_FEED_PARENT_NOT_FOUND", "답글을 달 대상 글을 찾지 못했습니다.");
			}
			if (parentPost.replyToPostId() != null) {
				throw new ChatServiceFeedServiceException(400, "CHAT_SERVICE_FEED_NESTED_REPLY_NOT_ALLOWED", "답글에는 다시 답글을 달 수 없습니다.");
			}
		}
		var row = repository.insertFeedPost(UUID.randomUUID(), currentProfileId, replyToPostId, body);
		if (row == null) {
			throw new ChatServiceFeedServiceException(500, "CHAT_SERVICE_FEED_CREATE_FAILED", "피드 글을 생성하지 못했습니다.");
		}
		return toMutationResponse(row);
	}
}
