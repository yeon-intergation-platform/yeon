package world.yeon.backend.star_lobby.service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.star_lobby.dto.StarLobbyDtos.DiscordWebhookAdminStatusResponse;
import world.yeon.backend.star_lobby.dto.StarLobbyDtos.DiscordWebhookRequest;
import world.yeon.backend.star_lobby.dto.StarLobbyDtos.DiscordWebhookStatusResponse;
import world.yeon.backend.star_lobby.dto.StarLobbyDtos.DiscordWebhookTestResponse;
import world.yeon.backend.star_lobby.repository.StarLobbyRepository;
import world.yeon.backend.star_lobby.repository.StarLobbyRepository.DiscordWebhookRow;
import world.yeon.backend.star_lobby.service.StarLobbyDiscordWebhookNotifier.DiscordWebhookNotification;

@Service
public class StarLobbyDiscordWebhookService {
	private static final Logger log = LoggerFactory.getLogger(StarLobbyDiscordWebhookService.class);

	private final StarLobbyRepository repository;
	private final StarLobbyDiscordWebhookNotifier notifier;
	private final StarLobbySecretProtector secretProtector;
	private final StarLobbyOperationsReadiness operationsReadiness;

	public StarLobbyDiscordWebhookService(
		StarLobbyRepository repository,
		StarLobbyDiscordWebhookNotifier notifier,
		StarLobbySecretProtector secretProtector,
		StarLobbyOperationsReadiness operationsReadiness
	) {
		this.repository = repository;
		this.notifier = notifier;
		this.secretProtector = secretProtector;
		this.operationsReadiness = operationsReadiness;
	}

	@Transactional(readOnly = true)
	public DiscordWebhookStatusResponse getStatus(UUID ownerUserId, String guestSessionId) {
		return repository.findDiscordWebhook(ownerUserId, guestSessionId)
			.filter(DiscordWebhookRow::enabled)
			.map(row -> new DiscordWebhookStatusResponse(true, row.updatedAt()))
			.orElseGet(() -> new DiscordWebhookStatusResponse(false, null));
	}

	@Transactional
	public DiscordWebhookStatusResponse upsert(UUID ownerUserId, String guestSessionId, DiscordWebhookRequest request) {
		StarLobbyDiscordWebhookUrl webhookUrl = webhookUrl(request);
		OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
		DiscordWebhookRow row = repository.upsertDiscordWebhook(UUID.randomUUID(), ownerUserId, guestSessionId, secretProtector.protect(webhookUrl.value()), now);
		return new DiscordWebhookStatusResponse(row.enabled(), row.updatedAt());
	}

	@Transactional
	public DiscordWebhookStatusResponse delete(UUID ownerUserId, String guestSessionId) {
		repository.deleteDiscordWebhook(ownerUserId, guestSessionId);
		return new DiscordWebhookStatusResponse(false, null);
	}

	@Transactional(readOnly = true)
	public DiscordWebhookAdminStatusResponse getAdminStatus() {
		return new DiscordWebhookAdminStatusResponse(
			false,
			secretProtector.hasConfiguredSecret(),
			secretProtector.allowsPersistentWrites(),
			operationsReadiness.springInternalTokenConfigured(),
			operationsReadiness.realtimeEventsUrlConfigured(),
			operationsReadiness.realtimeInternalTokenConfigured(),
			repository.countDiscordWebhooks(false),
			repository.countDiscordWebhooks(true)
		);
	}

	public DiscordWebhookTestResponse sendTest(DiscordWebhookRequest request) {
		notifier.sendTest(webhookUrl(request).value());
		return new DiscordWebhookTestResponse(true);
	}

	public void notifyAfterCommit(List<MatchedAlertNotificationCandidate> candidates) {
		if (candidates == null || candidates.isEmpty()) {
			notifier.notifyAfterCommit(List.of());
			return;
		}
		Map<OwnerKey, DiscordWebhookRow> webhooksByOwner = enabledWebhooksByOwner(candidates);
		List<DiscordWebhookNotification> notifications = new ArrayList<>();
		for (MatchedAlertNotificationCandidate candidate : candidates) {
			DiscordWebhookRow webhook = webhooksByOwner.get(new OwnerKey(candidate.ownerUserId(), candidate.guestSessionId()));
			if (webhook == null) continue;
			try {
				notifications.add(new DiscordWebhookNotification(
					secretProtector.reveal(webhook.webhookUrlEncrypted()),
					content(candidate)
				));
			} catch (StarLobbyServiceException error) {
				log.warn("스타 로비 Discord 웹훅 정보를 해석하지 못해 알림을 건너뜁니다: ownerUserId={}, guestSessionId={}", candidate.ownerUserId(), candidate.guestSessionId());
			}
		}
		notifier.notifyAfterCommit(notifications);
	}

	private Map<OwnerKey, DiscordWebhookRow> enabledWebhooksByOwner(List<MatchedAlertNotificationCandidate> candidates) {
		Set<UUID> ownerUserIds = candidates.stream().map(MatchedAlertNotificationCandidate::ownerUserId).filter(id -> id != null).collect(Collectors.toSet());
		Set<String> guestSessionIds = candidates.stream().map(MatchedAlertNotificationCandidate::guestSessionId).filter(id -> id != null && !id.isBlank()).collect(Collectors.toSet());
		return repository.listEnabledDiscordWebhooks(ownerUserIds, guestSessionIds).stream()
			.collect(Collectors.toMap(row -> new OwnerKey(row.ownerUserId(), row.guestSessionId()), Function.identity(), (left, right) -> left));
	}

	private StarLobbyDiscordWebhookUrl webhookUrl(DiscordWebhookRequest request) {
		if (request == null) {
			throw new StarLobbyServiceException(400, "STAR_LOBBY_INVALID_DISCORD_WEBHOOK", "Discord 웹훅 URL을 입력해 주세요.");
		}
		return new StarLobbyDiscordWebhookUrl(request.webhookUrl());
	}

	private String content(MatchedAlertNotificationCandidate candidate) {
		String players = candidate.currentPlayers() == null || candidate.maxPlayers() == null
			? "인원 미확인"
			: candidate.currentPlayers() + "/" + candidate.maxPlayers();
		return "[방 떴다]\n"
			+ candidate.ruleName() + " 조건과 맞는 스타 유즈맵 방이 관측됐습니다.\n\n"
			+ "방제: " + candidate.roomTitle() + " " + players + "\n"
			+ "감지 키워드: " + candidate.matchedKeyword() + "\n"
			+ "관측 시간: " + candidate.observedAt();
	}

	private record OwnerKey(UUID ownerUserId, String guestSessionId) {}

	public record MatchedAlertNotificationCandidate(
		UUID ownerUserId,
		String guestSessionId,
		String ruleName,
		String roomTitle,
		Integer currentPlayers,
		Integer maxPlayers,
		String matchedKeyword,
		OffsetDateTime observedAt
	) {}
}
