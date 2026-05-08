package world.yeon.backend.chat_service_ask.mapper;

import java.util.List;
import java.util.Set;
import world.yeon.backend.chat_service_ask.dto.*;
import world.yeon.backend.chat_service_ask.repository.ChatServiceAskRepository;

public final class ChatServiceAskMapper {
	private ChatServiceAskMapper() {}

	public static ChatServiceAskListResponse toListResponse(List<ChatServiceAskRepository.AskPostRow> rows, List<ChatServiceAskRepository.AskVoteRow> votes, Set<java.util.UUID> blockedRelationIds, java.util.UUID currentProfileId) {
		return new ChatServiceAskListResponse(toVisiblePosts(rows, votes, blockedRelationIds, currentProfileId));
	}

	public static ChatServiceAskMutationResponse toMutationResponse(ChatServiceAskRepository.AskPostRow row, List<ChatServiceAskRepository.AskVoteRow> votes, java.util.UUID currentProfileId) {
		return new ChatServiceAskMutationResponse(toPost(row, votes, currentProfileId));
	}

	private static List<ChatServiceAskPostResponse> toVisiblePosts(List<ChatServiceAskRepository.AskPostRow> rows, List<ChatServiceAskRepository.AskVoteRow> votes, Set<java.util.UUID> blockedRelationIds, java.util.UUID currentProfileId) {
		return rows.stream().filter(row -> !blockedRelationIds.contains(row.authorId())).map(row -> toPost(row, votes.stream().filter(v -> v.postId().equals(row.id())).toList(), currentProfileId)).toList();
	}

	private static ChatServiceAskPostResponse toPost(ChatServiceAskRepository.AskPostRow row, List<ChatServiceAskRepository.AskVoteRow> votes, java.util.UUID currentProfileId) {
		List<String> options = parseOptions(row.optionsJson());
		Integer userVote = votes.stream().filter(v -> v.voterId().equals(currentProfileId)).map(ChatServiceAskRepository.AskVoteRow::optionIndex).findFirst().orElse(null);
		return new ChatServiceAskPostResponse(
			row.id(),
			row.question(),
			row.kind(),
			java.util.stream.IntStream.range(0, options.size()).mapToObj(index -> new ChatServiceAskOptionResponse(index, options.get(index), (int) votes.stream().filter(v -> v.optionIndex() == index).count())).toList(),
			votes.size(),
			userVote,
			new ChatServiceAskProfileSummaryResponse(row.authorId(), row.authorNickname(), row.authorAgeLabel(), row.authorRegionLabel(), row.authorAvatarUrl(), row.authorBio(), row.authorPoints()),
			row.createdAt()
		);
	}

	private static List<String> parseOptions(String optionsJson) {
		try {
			com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
			return mapper.readValue(optionsJson, mapper.getTypeFactory().constructCollectionType(List.class, String.class));
		} catch (Exception ignored) {
			return List.of();
		}
	}
}
