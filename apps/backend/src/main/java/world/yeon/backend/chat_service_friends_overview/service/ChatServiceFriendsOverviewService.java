package world.yeon.backend.chat_service_friends_overview.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.chat_service_friends_overview.dto.ChatServiceFriendCardResponse;
import world.yeon.backend.chat_service_friends_overview.dto.ChatServiceFriendsOverviewResponse;
import world.yeon.backend.chat_service_friends_overview.dto.ChatServiceProfileSummaryResponse;
import world.yeon.backend.chat_service_friends_overview.repository.ChatServiceFriendsOverviewRepository;

@Service
public class ChatServiceFriendsOverviewService {
	private final ChatServiceFriendsOverviewRepository repository;

	public ChatServiceFriendsOverviewService(ChatServiceFriendsOverviewRepository repository) {
		this.repository = repository;
	}

	@Transactional(readOnly = true)
	public ChatServiceFriendsOverviewResponse getOverview(UUID currentProfileId) {
		List<ChatServiceFriendsOverviewRepository.FriendLinkRow> links = repository.listLinks(currentProfileId);
		List<ChatServiceFriendsOverviewRepository.BlockPairRow> blockPairs = repository.listBlockPairs(currentProfileId);
		List<ChatServiceFriendsOverviewRepository.ProfileRow> blockedProfiles = repository.listBlockedProfiles(currentProfileId);
		Set<UUID> relatedIds = new LinkedHashSet<>();

		for (ChatServiceFriendsOverviewRepository.BlockPairRow pair : blockPairs) {
			relatedIds.add(pair.blockerId().equals(currentProfileId) ? pair.blockedId() : pair.blockerId());
		}
		for (ChatServiceFriendsOverviewRepository.FriendLinkRow link : links) {
			relatedIds.add(link.requesterId().equals(currentProfileId) ? link.addresseeId() : link.requesterId());
		}

		Map<UUID, ChatServiceFriendsOverviewRepository.ProfileRow> profileMap = new LinkedHashMap<>();
		for (ChatServiceFriendsOverviewRepository.ProfileRow row : repository.listProfilesByIds(relatedIds)) {
			profileMap.put(row.id(), row);
		}

		List<ChatServiceFriendCardResponse> friends = new ArrayList<>();
		List<ChatServiceFriendCardResponse> pendingSent = new ArrayList<>();
		List<ChatServiceFriendCardResponse> pendingReceived = new ArrayList<>();
		for (ChatServiceFriendsOverviewRepository.FriendLinkRow link : links) {
			UUID targetId = link.requesterId().equals(currentProfileId) ? link.addresseeId() : link.requesterId();
			ChatServiceFriendsOverviewRepository.ProfileRow profile = profileMap.get(targetId);
			if (profile == null) continue;
			ChatServiceFriendCardResponse card = new ChatServiceFriendCardResponse(toSummary(profile), link.requesterId().equals(currentProfileId) ? ("accepted".equals(link.status()) ? "accepted" : "pending_sent") : ("accepted".equals(link.status()) ? "accepted" : "pending_received"), blankToNull(profile.bio()));
			if ("accepted".equals(link.status())) {
				friends.add(card);
			} else if (link.requesterId().equals(currentProfileId)) {
				pendingSent.add(card);
			} else {
				pendingReceived.add(card);
			}
		}

		Set<UUID> excludedIds = new LinkedHashSet<>(relatedIds);
		excludedIds.add(currentProfileId);
		List<ChatServiceProfileSummaryResponse> suggested = repository.listSuggestedProfiles(excludedIds, 8).stream()
			.map(this::toSummary)
			.toList();

		return new ChatServiceFriendsOverviewResponse(
			friends,
			pendingSent,
			pendingReceived,
			suggested,
			blockedProfiles.stream().map(this::toSummary).toList()
		);
	}

	private ChatServiceProfileSummaryResponse toSummary(ChatServiceFriendsOverviewRepository.ProfileRow row) {
		return new ChatServiceProfileSummaryResponse(row.id().toString(), row.nickname(), row.ageLabel(), row.regionLabel(), row.avatarUrl(), row.bio(), row.points());
	}

	private String blankToNull(String value) {
		return value == null || value.isBlank() ? null : value;
	}
}
