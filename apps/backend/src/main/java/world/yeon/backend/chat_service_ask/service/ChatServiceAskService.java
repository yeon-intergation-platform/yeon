package world.yeon.backend.chat_service_ask.service;

import static world.yeon.backend.chat_service_ask.mapper.ChatServiceAskMapper.toListResponse;
import static world.yeon.backend.chat_service_ask.mapper.ChatServiceAskMapper.toMutationResponse;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.chat_service_ask.dto.ChatServiceAskListResponse;
import world.yeon.backend.chat_service_ask.dto.ChatServiceAskMutationResponse;
import world.yeon.backend.chat_service_ask.repository.ChatServiceAskRepository;

@Service
public class ChatServiceAskService {
	private final ChatServiceAskRepository repository;
	private final ObjectMapper objectMapper = new ObjectMapper();

	public ChatServiceAskService(ChatServiceAskRepository repository) {
		this.repository = repository;
	}

	@Transactional(readOnly = true)
	public ChatServiceAskListResponse list(UUID currentProfileId) {
		var rows = repository.listAskPosts();
		var votes = repository.listVotes(rows.stream().map(ChatServiceAskRepository.AskPostRow::id).toList());
		var blocked = repository.listBlockedRelationIds(currentProfileId);
		return toListResponse(rows, votes, blocked, currentProfileId);
	}

	@Transactional
	public ChatServiceAskMutationResponse create(UUID currentProfileId, String question, String kind, List<String> options) {
		try {
			var row = repository.insertAskPost(UUID.randomUUID(), currentProfileId, question, kind, objectMapper.writeValueAsString(options));
			return toMutationResponse(row, List.of(), currentProfileId);
		} catch (Exception error) {
			throw new ChatServiceAskServiceException(500, "CHAT_SERVICE_ASK_CREATE_FAILED", "에스크 글을 생성하지 못했습니다.");
		}
	}

	@Transactional
	public ChatServiceAskMutationResponse vote(UUID currentProfileId, UUID postId, int optionIndex) {
		var post = repository.findAskPost(postId);
		if (post == null) {
			throw new ChatServiceAskServiceException(404, "CHAT_SERVICE_ASK_POST_NOT_FOUND", "투표 글을 찾지 못했습니다.");
		}
		if (!"poll".equals(post.kind())) {
			throw new ChatServiceAskServiceException(400, "CHAT_SERVICE_ASK_NOT_POLL", "일반 질문글에는 투표할 수 없습니다.");
		}
		List<String> options = parseOptions(post.optionsJson());
		if (optionIndex < 0 || optionIndex >= options.size()) {
			throw new ChatServiceAskServiceException(400, "CHAT_SERVICE_ASK_OPTION_INDEX_INVALID", "선택지 인덱스가 올바르지 않습니다.");
		}
		var existingVote = repository.findVote(postId, currentProfileId);
		if (existingVote != null) {
			repository.updateVote(existingVote.id(), optionIndex);
		} else {
			repository.insertVote(UUID.randomUUID(), postId, currentProfileId, optionIndex);
		}
		var votes = repository.listVotes(List.of(postId));
		return toMutationResponse(post, votes, currentProfileId);
	}

	private List<String> parseOptions(String optionsJson) {
		try {
			return objectMapper.readValue(optionsJson, objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
		} catch (Exception ignored) {
			return List.of();
		}
	}
}
