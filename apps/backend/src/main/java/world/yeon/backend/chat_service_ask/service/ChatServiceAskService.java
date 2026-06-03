package world.yeon.backend.chat_service_ask.service;

import static world.yeon.backend.chat_service_ask.mapper.ChatServiceAskMapper.toListResponse;
import static world.yeon.backend.chat_service_ask.mapper.ChatServiceAskMapper.toMutationResponse;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.chat_service_ask.dto.ChatServiceAskListResponse;
import world.yeon.backend.chat_service_ask.dto.ChatServiceAskMutationResponse;
import world.yeon.backend.chat_service_ask.repository.ChatServiceAskRepository;

@Service
public class ChatServiceAskService {
	private static final Set<String> ALLOWED_KINDS = Set.of("poll", "question");
	private static final int MAX_QUESTION_LENGTH = 240;
	private static final int MAX_OPTION_LENGTH = 80;
	private static final int MAX_OPTIONS = 4;
	private final ChatServiceAskRepository repository;
	private final ObjectMapper objectMapper;

	public ChatServiceAskService(ChatServiceAskRepository repository, ObjectMapper objectMapper) {
		this.repository = repository;
		this.objectMapper = objectMapper;
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
		String normalizedQuestion = normalizeQuestion(question);
		String normalizedKind = normalizeKind(kind);
		List<String> normalizedOptions = normalizeOptions(normalizedKind, options);
		String optionsJson;
		try {
			optionsJson = objectMapper.writeValueAsString(normalizedOptions);
		} catch (Exception error) {
			throw new ChatServiceAskServiceException(500, "CHAT_SERVICE_ASK_CREATE_FAILED", "에스크 글을 생성하지 못했습니다.");
		}
		try {
			var row = repository.insertAskPost(UUID.randomUUID(), currentProfileId, normalizedQuestion, normalizedKind, optionsJson);
			return toMutationResponse(row, List.of(), currentProfileId);
		} catch (DataIntegrityViolationException error) {
			throw new ChatServiceAskServiceException(500, "CHAT_SERVICE_ASK_CREATE_FAILED", "에스크 글을 생성하지 못했습니다.");
		}
	}

	private String normalizeQuestion(String question) {
		if (question == null) {
			throw new ChatServiceAskServiceException(400, "CHAT_SERVICE_ASK_QUESTION_INVALID", "질문 내용을 입력해 주세요.");
		}
		String normalized = question.trim();
		if (normalized.isEmpty() || normalized.length() > MAX_QUESTION_LENGTH) {
			throw new ChatServiceAskServiceException(400, "CHAT_SERVICE_ASK_QUESTION_INVALID", "질문은 1자 이상 " + MAX_QUESTION_LENGTH + "자 이하로 입력해 주세요.");
		}
		return normalized;
	}

	private String normalizeKind(String kind) {
		if (kind == null || !ALLOWED_KINDS.contains(kind)) {
			throw new ChatServiceAskServiceException(400, "CHAT_SERVICE_ASK_KIND_INVALID", "지원하지 않는 질문 유형입니다.");
		}
		return kind;
	}

	private List<String> normalizeOptions(String kind, List<String> options) {
		if (!"poll".equals(kind)) {
			return List.of();
		}
		if (options == null || options.size() < 2 || options.size() > MAX_OPTIONS) {
			throw new ChatServiceAskServiceException(400, "CHAT_SERVICE_ASK_OPTIONS_INVALID", "투표 선택지는 2개 이상 " + MAX_OPTIONS + "개 이하로 입력해 주세요.");
		}
		List<String> normalized = new java.util.ArrayList<>(options.size());
		for (String option : options) {
			if (option == null) {
				throw new ChatServiceAskServiceException(400, "CHAT_SERVICE_ASK_OPTIONS_INVALID", "선택지 내용을 입력해 주세요.");
			}
			String trimmed = option.trim();
			if (trimmed.isEmpty() || trimmed.length() > MAX_OPTION_LENGTH) {
				throw new ChatServiceAskServiceException(400, "CHAT_SERVICE_ASK_OPTIONS_INVALID", "각 선택지는 1자 이상 " + MAX_OPTION_LENGTH + "자 이하로 입력해 주세요.");
			}
			normalized.add(trimmed);
		}
		return normalized;
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
			try {
				repository.insertVote(UUID.randomUUID(), postId, currentProfileId, optionIndex);
			} catch (DataIntegrityViolationException raced) {
				// 동시에 같은 사용자가 두 번 투표하면 UNIQUE(post_id, voter_id) 위반이 발생한다.
				// 트랜잭션이 롤백 표시될 수 있으므로 500 대신 멱등 재시도를 안내하는 409로 변환한다.
				throw new ChatServiceAskServiceException(409, "CHAT_SERVICE_ASK_VOTE_CONFLICT", "투표가 이미 처리되었습니다. 다시 시도해 주세요.");
			}
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
