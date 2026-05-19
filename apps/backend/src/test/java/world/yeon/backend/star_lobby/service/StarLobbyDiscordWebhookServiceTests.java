package world.yeon.backend.star_lobby.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import world.yeon.backend.star_lobby.dto.StarLobbyDtos.DiscordWebhookRequest;
import world.yeon.backend.star_lobby.repository.StarLobbyRepository;

@ExtendWith(MockitoExtension.class)
class StarLobbyDiscordWebhookServiceTests {
	private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000002001");
	private static final OffsetDateTime OBSERVED_AT = OffsetDateTime.parse("2026-05-19T01:30:00Z");

	@Mock private StarLobbyRepository repository;
	@Mock private StarLobbyDiscordWebhookNotifier notifier;
	@Mock private StarLobbySecretProtector secretProtector;
	@Mock private StarLobbyOperationsReadiness operationsReadiness;
	private StarLobbyDiscordWebhookService service;

	@BeforeEach void setUp() {
		service = new StarLobbyDiscordWebhookService(repository, notifier, secretProtector, operationsReadiness);
	}

	@Test void 디스코드웹훅을보호문자열로저장한다() {
		var row = new StarLobbyRepository.DiscordWebhookRow(UUID.randomUUID(), null, "guest-1", "protected", true, OBSERVED_AT, OBSERVED_AT);
		when(secretProtector.protect("https://discord.com/api/webhooks/1/token")).thenReturn("protected");
		when(repository.upsertDiscordWebhook(any(), isNull(), eq("guest-1"), eq("protected"), any())).thenReturn(row);

		var result = service.upsert(null, "guest-1", new DiscordWebhookRequest("https://discord.com/api/webhooks/1/token"));

		assertThat(result.connected()).isTrue();
	}

	@Test void 디스코드전역환경변수없이도운영상태를반환한다() {
		when(secretProtector.hasConfiguredSecret()).thenReturn(false);
		when(secretProtector.allowsPersistentWrites()).thenReturn(false);
		when(operationsReadiness.springInternalTokenConfigured()).thenReturn(true);
		when(operationsReadiness.realtimeEventsUrlConfigured()).thenReturn(true);
		when(operationsReadiness.realtimeInternalTokenConfigured()).thenReturn(true);
		when(repository.countDiscordWebhooks(false)).thenReturn(2L);
		when(repository.countDiscordWebhooks(true)).thenReturn(1L);

		var result = service.getAdminStatus();

		assertThat(result.globalDiscordEnvRequired()).isFalse();
		assertThat(result.secretConfigured()).isFalse();
		assertThat(result.webhookPersistenceAllowed()).isFalse();
		assertThat(result.springInternalTokenConfigured()).isTrue();
		assertThat(result.realtimeEventsUrlConfigured()).isTrue();
		assertThat(result.realtimeInternalTokenConfigured()).isTrue();
		assertThat(result.registeredWebhookCount()).isEqualTo(2);
		assertThat(result.enabledWebhookCount()).isEqualTo(1);
	}

	@Test void 매칭후보소유자의활성웹훅만묶어서알림을예약한다() {
		var webhook = new StarLobbyRepository.DiscordWebhookRow(UUID.randomUUID(), USER_ID, null, "protected", true, OBSERVED_AT, OBSERVED_AT);
		when(repository.listEnabledDiscordWebhooks(Set.of(USER_ID), Set.of())).thenReturn(List.of(webhook));
		when(secretProtector.reveal("protected")).thenReturn("https://discord.com/api/webhooks/1/token");

		service.notifyAfterCommit(List.of(new StarLobbyDiscordWebhookService.MatchedAlertNotificationCandidate(
			USER_ID,
			null,
			"랜타디",
			"랜타디 초보 환영",
			3,
			6,
			"랜타디",
			OBSERVED_AT
		)));

		verify(notifier).notifyAfterCommit(argThat(notifications -> notifications.size() == 1
			&& notifications.getFirst().webhookUrl().equals("https://discord.com/api/webhooks/1/token")
			&& notifications.getFirst().content().contains("랜타디 초보 환영")));
	}

	@Test void 웹훅해석실패는해당알림만건너뛴다() {
		var webhook = new StarLobbyRepository.DiscordWebhookRow(UUID.randomUUID(), USER_ID, null, "broken", true, OBSERVED_AT, OBSERVED_AT);
		when(repository.listEnabledDiscordWebhooks(Set.of(USER_ID), Set.of())).thenReturn(List.of(webhook));
		when(secretProtector.reveal("broken")).thenThrow(new StarLobbyServiceException(500, "STAR_LOBBY_SECRET_REVEAL_FAILED", "Discord 웹훅 정보를 해석하지 못했습니다."));

		service.notifyAfterCommit(List.of(new StarLobbyDiscordWebhookService.MatchedAlertNotificationCandidate(
			USER_ID,
			null,
			"랜타디",
			"랜타디 초보 환영",
			null,
			null,
			"랜타디",
			OBSERVED_AT
		)));

		verify(notifier).notifyAfterCommit(List.of());
	}

	@Test void 디스코드가아닌웹훅URL은거부한다() {
		assertThatThrownBy(() -> service.upsert(null, "guest-1", new DiscordWebhookRequest("https://example.com/api/webhooks/1/token")))
			.isInstanceOf(StarLobbyServiceException.class)
			.hasMessage("Discord 웹훅 URL 형식이 올바르지 않습니다.");
	}
}
