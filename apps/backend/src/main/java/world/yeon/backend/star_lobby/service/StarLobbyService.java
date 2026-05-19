package world.yeon.backend.star_lobby.service;

import java.text.Normalizer;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.star_lobby.dto.StarLobbyDtos.*;
import world.yeon.backend.star_lobby.repository.StarLobbyRepository;
import world.yeon.backend.star_lobby.repository.StarLobbyRepository.AlertMatchRow;
import world.yeon.backend.star_lobby.repository.StarLobbyRepository.AlertRuleRow;
import world.yeon.backend.star_lobby.repository.StarLobbyRepository.ObservedRoomRow;

@Service
public class StarLobbyService {
	private static final int RECENT_ROOM_LIMIT = 100;
	private static final String EVENT_ROOM_OBSERVED = "room_observed";
	private static final String EVENT_ROOM_DISAPPEARED = "room_disappeared";
	private static final String EVENT_ALERT_MATCHED = "alert_matched";

	private final StarLobbyRepository repository;
	private final StarLobbyRealtimePublisher realtimePublisher;

	public StarLobbyService(StarLobbyRepository repository, StarLobbyRealtimePublisher realtimePublisher) {
		this.repository = repository;
		this.realtimePublisher = realtimePublisher;
	}

	@Transactional(readOnly = true)
	public RoomListResponse listRecentRooms() {
		var rooms = repository.listRecentRooms(RECENT_ROOM_LIMIT);
		OffsetDateTime observedAt = rooms.stream().map(ObservedRoomRow::lastSeenAt).filter(v -> v != null).findFirst().orElse(null);
		return new RoomListResponse(rooms.stream().map(this::toRoomResponse).toList(), observedAt);
	}

	@Transactional
	public ObservationIngestResponse ingestObservation(IngestObservationRequest request) {
		OffsetDateTime observedAt = request != null && request.observedAt() != null
			? request.observedAt()
			: OffsetDateTime.now(ZoneOffset.UTC);
		List<ObservationRoomRequest> inputRooms = request == null || request.rooms() == null ? List.of() : request.rooms();
		List<ObservedRoomRow> savedRooms = new ArrayList<>();
		Set<String> observedKeys = new LinkedHashSet<>();
		for (ObservationRoomRequest input : inputRooms) {
			String title = normalizeText(input == null ? null : input.title(), "방제", 160);
			Integer currentPlayers = validatePlayer(input.currentPlayers(), "현재 인원", 0, 12, true);
			Integer maxPlayers = validatePlayer(input.maxPlayers(), "최대 인원", 1, 12, true);
			String roomKey = roomKey(title, currentPlayers, maxPlayers);
			observedKeys.add(roomKey);
			savedRooms.add(repository.upsertObservedRoom(UUID.randomUUID(), roomKey, title, currentPlayers, maxPlayers, observedAt, trimToNull(input.rawText())));
		}
		List<ObservedRoomRow> disappearedRooms = repository.markMissingRoomsDisappeared(observedKeys, observedAt);
		List<AlertMatched> matchedAlerts = matchEnabledRules(savedRooms, observedAt);
		List<AlertMatchResponse> matches = matchedAlerts.stream().map(alert -> toMatchResponse(alert.match())).toList();
		realtimePublisher.publishAfterCommit(realtimeEvents(savedRooms, disappearedRooms, matchedAlerts));
		return new ObservationIngestResponse(savedRooms.stream().map(this::toRoomResponse).toList(), matches, observedAt);
	}

	@Transactional(readOnly = true)
	public AlertRuleListResponse listAlertRules(UUID ownerUserId, String guestSessionId) {
		Owner owner = resolveOwner(ownerUserId, guestSessionId);
		return new AlertRuleListResponse(repository.listAlertRules(owner.userId(), owner.guestSessionId()).stream().map(this::toRuleResponse).toList());
	}

	@Transactional
	public AlertRuleMutationResponse createAlertRule(UUID ownerUserId, String guestSessionId, AlertRuleRequest request) {
		Owner owner = resolveOwner(ownerUserId, guestSessionId);
		if (request == null) throw new StarLobbyServiceException(400, "STAR_LOBBY_INVALID_RULE", "알림 조건을 입력해 주세요.");
		List<String> includeKeywords = normalizeKeywords(request.includeKeywords(), "포함 키워드", 1, 20);
		List<String> excludeKeywords = normalizeKeywords(request.excludeKeywords(), "제외 키워드", 0, 20);
		Integer minPlayers = validatePlayer(request.minPlayers(), "최소 인원", 0, 12, true);
		Integer maxPlayers = validatePlayer(request.maxPlayers(), "최대 인원", 1, 12, true);
		if (minPlayers != null && maxPlayers != null && minPlayers > maxPlayers) {
			throw new StarLobbyServiceException(400, "STAR_LOBBY_INVALID_RULE", "최소 인원은 최대 인원보다 클 수 없습니다.");
		}
		OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
		AlertRuleRow row = repository.insertAlertRule(
			UUID.randomUUID(),
			owner.userId(),
			owner.guestSessionId(),
			normalizeText(request.name(), "알림 이름", 80),
			includeKeywords,
			excludeKeywords,
			minPlayers,
			maxPlayers,
			now
		);
		return new AlertRuleMutationResponse(toRuleResponse(row));
	}

	private List<AlertMatched> matchEnabledRules(List<ObservedRoomRow> rooms, OffsetDateTime matchedAt) {
		if (rooms.isEmpty()) return List.of();
		List<AlertRuleRow> rules = repository.listEnabledAlertRules();
		List<AlertMatched> matches = new ArrayList<>();
		for (ObservedRoomRow room : rooms) {
			for (AlertRuleRow rule : rules) {
				MatchResult result = match(rule, room);
				if (result == null) continue;
				AlertMatchRow inserted = repository.insertAlertMatchIfAbsent(
					UUID.randomUUID(),
					rule.id(),
					room.id(),
					result.status(),
					result.matchedKeyword(),
					result.suppressedKeyword(),
					matchedAt
				);
				if (inserted != null && "matched".equals(inserted.status())) matches.add(new AlertMatched(inserted, rule, room));
			}
		}
		return matches;
	}


	private List<StarLobbyRealtimeEvent> realtimeEvents(List<ObservedRoomRow> observedRooms, List<ObservedRoomRow> disappearedRooms, List<AlertMatched> matchedAlerts) {
		List<StarLobbyRealtimeEvent> events = new ArrayList<>();
		for (ObservedRoomRow room : observedRooms) {
			events.add(new StarLobbyRealtimeEvent(EVENT_ROOM_OBSERVED, toRoomResponse(room), null, null, null));
		}
		for (ObservedRoomRow room : disappearedRooms == null ? List.<ObservedRoomRow>of() : disappearedRooms) {
			events.add(new StarLobbyRealtimeEvent(EVENT_ROOM_DISAPPEARED, toRoomResponse(room), null, null, null));
		}
		for (AlertMatched alert : matchedAlerts) {
			AlertRuleRow rule = alert.rule();
			events.add(new StarLobbyRealtimeEvent(
				EVENT_ALERT_MATCHED,
				toRoomResponse(alert.room()),
				toMatchResponse(alert.match()),
				toRuleResponse(rule),
				new StarLobbyRealtimeRecipient(rule.ownerUserId(), rule.guestSessionId())
			));
		}
		return events;
	}

	private MatchResult match(AlertRuleRow rule, ObservedRoomRow room) {
		if (rule.minPlayers() != null && (room.currentPlayers() == null || room.currentPlayers() < rule.minPlayers())) return null;
		if (rule.maxPlayers() != null && (room.currentPlayers() == null || room.currentPlayers() > rule.maxPlayers())) return null;
		String normalizedTitle = comparable(room.title());
		String matchedKeyword = firstKeyword(rule.includeKeywords(), normalizedTitle);
		if (matchedKeyword == null) return null;
		String suppressedKeyword = firstKeyword(rule.excludeKeywords(), normalizedTitle);
		if (suppressedKeyword != null) return new MatchResult("suppressed", matchedKeyword, suppressedKeyword);
		return new MatchResult("matched", matchedKeyword, null);
	}

	private String firstKeyword(List<String> keywords, String normalizedTitle) {
		for (String keyword : keywords == null ? List.<String>of() : keywords) {
			if (normalizedTitle.contains(comparable(keyword))) return keyword;
		}
		return null;
	}

	private ObservedRoomResponse toRoomResponse(ObservedRoomRow row) {
		return new ObservedRoomResponse(row.id(), row.title(), row.currentPlayers(), row.maxPlayers(), row.status(), row.observedAt(), row.lastSeenAt(), row.disappearedAt(), List.of(), row.rawText());
	}

	private AlertRuleResponse toRuleResponse(AlertRuleRow row) {
		return new AlertRuleResponse(row.id(), row.name(), row.includeKeywords(), row.excludeKeywords(), row.minPlayers(), row.maxPlayers(), row.enabled(), row.createdAt(), row.updatedAt());
	}

	private AlertMatchResponse toMatchResponse(AlertMatchRow row) {
		return new AlertMatchResponse(row.id(), row.ruleId(), row.roomId(), row.status(), row.matchedKeyword(), row.suppressedKeyword(), row.matchedAt());
	}

	private Owner resolveOwner(UUID userId, String guestSessionId) {
		if (userId != null) return new Owner(userId, trimToNull(guestSessionId));
		String guest = trimToNull(guestSessionId);
		if (guest == null) {
			throw new StarLobbyServiceException(401, "STAR_LOBBY_OWNER_REQUIRED", "알림 조건을 저장하려면 로그인하거나 게스트 세션이 필요합니다.");
		}
		if (guest.length() > 128) {
			throw new StarLobbyServiceException(400, "STAR_LOBBY_INVALID_OWNER", "게스트 세션은 128자 이하로 입력해 주세요.");
		}
		return new Owner(null, guest);
	}

	private List<String> normalizeKeywords(List<String> values, String label, int min, int max) {
		List<String> normalized = new ArrayList<>();
		if (values != null) {
			for (String value : values) {
				String keyword = normalizeText(value, label, 80);
				if (!normalized.contains(keyword)) normalized.add(keyword);
			}
		}
		if (normalized.size() < min) throw new StarLobbyServiceException(400, "STAR_LOBBY_INVALID_RULE", label + "를 입력해 주세요.");
		if (normalized.size() > max) throw new StarLobbyServiceException(400, "STAR_LOBBY_INVALID_RULE", label + "는 " + max + "개 이하로 입력해 주세요.");
		return normalized;
	}

	private String normalizeText(String input, String label, int maxLength) {
		String normalized = trimToNull(input);
		if (normalized == null) throw new StarLobbyServiceException(400, "STAR_LOBBY_INVALID_INPUT", label + "를 입력해 주세요.");
		if (normalized.length() > maxLength) throw new StarLobbyServiceException(400, "STAR_LOBBY_INVALID_INPUT", label + "는 " + maxLength + "자 이하로 입력해 주세요.");
		return normalized;
	}

	private Integer validatePlayer(Integer value, String label, int min, int max, boolean nullable) {
		if (value == null && nullable) return null;
		if (value == null) throw new StarLobbyServiceException(400, "STAR_LOBBY_INVALID_INPUT", label + "을 입력해 주세요.");
		if (value < min || value > max) throw new StarLobbyServiceException(400, "STAR_LOBBY_INVALID_INPUT", label + "은 " + min + "~" + max + " 사이여야 합니다.");
		return value;
	}

	private String roomKey(String title, Integer currentPlayers, Integer maxPlayers) {
		return comparable(title) + "|" + (currentPlayers == null ? "" : currentPlayers) + "|" + (maxPlayers == null ? "" : maxPlayers);
	}

	private String comparable(String value) {
		String normalized = Normalizer.normalize(value == null ? "" : value, Normalizer.Form.NFKC);
		return normalized.toLowerCase(Locale.ROOT).replaceAll("\\s+", "").trim();
	}

	private String trimToNull(String input) {
		if (input == null) return null;
		String normalized = input.trim();
		return normalized.isEmpty() ? null : normalized;
	}

	private record Owner(UUID userId, String guestSessionId) {}
	private record AlertMatched(AlertMatchRow match, AlertRuleRow rule, ObservedRoomRow room) {}
	private record MatchResult(String status, String matchedKeyword, String suppressedKeyword) {}
}
