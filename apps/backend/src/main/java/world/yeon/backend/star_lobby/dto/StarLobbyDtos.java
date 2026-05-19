package world.yeon.backend.star_lobby.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class StarLobbyDtos {
	public record ObservedRoomResponse(
		UUID id,
		String title,
		Integer currentPlayers,
		Integer maxPlayers,
		String status,
		OffsetDateTime observedAt,
		OffsetDateTime lastSeenAt,
		OffsetDateTime disappearedAt,
		List<String> matchedKeywords,
		String rawText
	) {}

	public record RoomListResponse(List<ObservedRoomResponse> rooms, OffsetDateTime observedAt) {}

	public record ObservationRoomRequest(
		String title,
		Integer currentPlayers,
		Integer maxPlayers,
		String rawText
	) {}

	public record IngestObservationRequest(OffsetDateTime observedAt, List<ObservationRoomRequest> rooms) {}

	public record AlertRuleRequest(
		String name,
		List<String> includeKeywords,
		List<String> excludeKeywords,
		Integer minPlayers,
		Integer maxPlayers
	) {}

	public record UpdateAlertRuleRequest(
		String name,
		List<String> includeKeywords,
		List<String> excludeKeywords,
		Integer minPlayers,
		Integer maxPlayers,
		Boolean enabled
	) {}

	public record AlertRuleResponse(
		UUID id,
		String name,
		List<String> includeKeywords,
		List<String> excludeKeywords,
		Integer minPlayers,
		Integer maxPlayers,
		boolean enabled,
		OffsetDateTime createdAt,
		OffsetDateTime updatedAt
	) {}

	public record AlertRuleListResponse(List<AlertRuleResponse> rules) {}

	public record AlertRuleMutationResponse(AlertRuleResponse rule) {}

	public record AlertMatchResponse(
		UUID id,
		UUID ruleId,
		UUID roomId,
		String status,
		String matchedKeyword,
		String suppressedKeyword,
		OffsetDateTime matchedAt
	) {}

	public record ObservationIngestResponse(
		List<ObservedRoomResponse> rooms,
		List<AlertMatchResponse> matches,
		OffsetDateTime observedAt
	) {}

	public record StarLobbyRealtimeRecipient(
		UUID ownerUserId,
		String guestSessionId
	) {}

	public record StarLobbyRealtimeEvent(
		String type,
		ObservedRoomResponse room,
		AlertMatchResponse match,
		AlertRuleResponse rule,
		StarLobbyRealtimeRecipient recipient
	) {}
}
