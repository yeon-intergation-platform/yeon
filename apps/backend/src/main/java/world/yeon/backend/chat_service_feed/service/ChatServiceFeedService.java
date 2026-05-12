package world.yeon.backend.chat_service_feed.service;

import static world.yeon.backend.chat_service_feed.mapper.ChatServiceFeedMapper.toListResponse;
import static world.yeon.backend.chat_service_feed.mapper.ChatServiceFeedMapper.toMutationResponse;
import static world.yeon.backend.chat_service_feed.mapper.ChatServiceFeedMapper.toRepliesResponse;

import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.chat_service_feed.dto.ChatServiceFeedDeleteResponse;
import world.yeon.backend.chat_service_feed.dto.ChatServiceFeedListResponse;
import world.yeon.backend.chat_service_feed.dto.ChatServiceFeedMutationResponse;
import world.yeon.backend.chat_service_feed.dto.ChatServiceFeedRepliesResponse;
import world.yeon.backend.chat_service_feed.repository.ChatServiceFeedRepository;

@Service
public class ChatServiceFeedService {
	private final ChatServiceFeedRepository repository;

	public ChatServiceFeedService(ChatServiceFeedRepository repository) {
		this.repository = repository;
	}

	@Transactional(readOnly = true)
	public ChatServiceFeedListResponse list(UUID currentProfileId) {
		var blocked = listBlockedRelationIds(currentProfileId);
		var rows = repository.listRootFeed();
		var replyCounts = repository.listReplyCounts(rows.stream().map(ChatServiceFeedRepository.FeedPostRow::id).toList(), blocked);
		return toListResponse(rows, blocked, replyCounts);
	}

	@Transactional(readOnly = true)
	public ChatServiceFeedMutationResponse get(UUID currentProfileId, UUID postId) {
		var blocked = listBlockedRelationIds(currentProfileId);
		var row = repository.findFeedPost(postId);
		if (row == null || row.replyToPostId() != null || blocked.contains(row.authorId())) {
			throw new ChatServiceFeedServiceException(404, "CHAT_SERVICE_FEED_NOT_FOUND", "피드 글을 찾지 못했습니다.");
		}
		var replyCounts = repository.listReplyCounts(java.util.List.of(row.id()), blocked);
		return toMutationResponse(row, replyCounts.getOrDefault(row.id(), 0));
	}

	@Transactional(readOnly = true)
	public ChatServiceFeedRepliesResponse listReplies(UUID currentProfileId, UUID postId) {
		var blocked = listBlockedRelationIds(currentProfileId);
		var rows = repository.listReplies(postId);
		var replyCounts = repository.listReplyCounts(rows.stream().map(ChatServiceFeedRepository.FeedPostRow::id).toList(), blocked);
		return toRepliesResponse(rows, blocked, replyCounts);
	}

	@Transactional
	public ChatServiceFeedMutationResponse create(UUID currentProfileId, String body, UUID replyToPostId) {
		var normalizedBody = normalizeBody(body);
		if (replyToPostId != null) {
			var parentPost = repository.findFeedPost(replyToPostId);
			if (parentPost == null) {
				throw new ChatServiceFeedServiceException(404, "CHAT_SERVICE_FEED_PARENT_NOT_FOUND", "답글을 달 대상 글을 찾지 못했습니다.");
			}
			if (parentPost.replyToPostId() != null) {
				throw new ChatServiceFeedServiceException(400, "CHAT_SERVICE_FEED_NESTED_REPLY_NOT_ALLOWED", "답글에는 다시 답글을 달 수 없습니다.");
			}
		}
		var row = repository.insertFeedPost(UUID.randomUUID(), currentProfileId, replyToPostId, normalizedBody);
		if (row == null) {
			throw new ChatServiceFeedServiceException(500, "CHAT_SERVICE_FEED_CREATE_FAILED", "피드 글을 생성하지 못했습니다.");
		}
		return toMutationResponse(row);
	}

	@Transactional
	public ChatServiceFeedMutationResponse update(UUID currentProfileId, UUID postId, String body) {
		var normalizedBody = normalizeBody(body);
		var currentPost = repository.findFeedPost(postId);
		if (currentPost == null) {
			throw new ChatServiceFeedServiceException(404, "CHAT_SERVICE_FEED_NOT_FOUND", "수정할 글을 찾지 못했습니다.");
		}
		if (currentPost.replyToPostId() != null) {
			throw new ChatServiceFeedServiceException(400, "CHAT_SERVICE_FEED_REPLY_UPDATE_NOT_ALLOWED", "댓글은 수정할 수 없습니다.");
		}
		if (!currentPost.authorId().equals(currentProfileId)) {
			throw new ChatServiceFeedServiceException(403, "CHAT_SERVICE_FEED_FORBIDDEN", "수정 권한이 없습니다.");
		}
		var updated = repository.updateFeedPostBody(postId, currentProfileId, normalizedBody);
		if (updated == null) {
			throw new ChatServiceFeedServiceException(500, "CHAT_SERVICE_FEED_UPDATE_FAILED", "글 수정에 실패했습니다.");
		}
		return toMutationResponse(updated);
	}

	@Transactional
	public ChatServiceFeedDeleteResponse delete(UUID currentProfileId, UUID postId) {
		var currentPost = repository.findFeedPost(postId);
		if (currentPost == null) {
			throw new ChatServiceFeedServiceException(404, "CHAT_SERVICE_FEED_NOT_FOUND", "삭제할 글을 찾지 못했습니다.");
		}
		if (!currentPost.authorId().equals(currentProfileId)) {
			throw new ChatServiceFeedServiceException(403, "CHAT_SERVICE_FEED_FORBIDDEN", "삭제 권한이 없습니다.");
		}
		if (currentPost.replyToPostId() == null) {
			repository.deleteReplies(postId);
		}
		int deletedCount = repository.deleteFeedPost(postId, currentProfileId);
		if (deletedCount == 0) {
			throw new ChatServiceFeedServiceException(500, "CHAT_SERVICE_FEED_DELETE_FAILED", "글 삭제에 실패했습니다.");
		}
		return new ChatServiceFeedDeleteResponse(true, postId);
	}

	private Set<UUID> listBlockedRelationIds(UUID currentProfileId) {
		if (currentProfileId == null) {
			return Set.of();
		}
		return repository.listBlockedRelationIds(currentProfileId);
	}

	private String normalizeBody(String body) {
		if (body == null) {
			throw new ChatServiceFeedServiceException(400, "CHAT_SERVICE_FEED_BODY_INVALID", "피드 글 본문을 입력해 주세요.");
		}
		var normalized = body.trim();
		if (normalized.isEmpty() || normalized.length() > 400) {
			throw new ChatServiceFeedServiceException(400, "CHAT_SERVICE_FEED_BODY_INVALID", "피드 글 본문은 1자 이상 400자 이하로 입력해 주세요.");
		}
		return normalized;
	}
}
