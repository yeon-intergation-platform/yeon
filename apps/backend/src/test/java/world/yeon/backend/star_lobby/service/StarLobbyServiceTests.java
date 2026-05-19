package world.yeon.backend.star_lobby.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import world.yeon.backend.star_lobby.dto.StarLobbyDtos.AlertRuleRequest;
import world.yeon.backend.star_lobby.dto.StarLobbyDtos.DiscordWebhookRequest;
import world.yeon.backend.star_lobby.dto.StarLobbyDtos.UpdateAlertRuleRequest;
import world.yeon.backend.star_lobby.dto.StarLobbyDtos.IngestObservationRequest;
import world.yeon.backend.star_lobby.dto.StarLobbyDtos.ObservationRoomRequest;
import world.yeon.backend.star_lobby.repository.StarLobbyRepository;

@ExtendWith(MockitoExtension.class)
class StarLobbyServiceTests {
	private static final UUID ROOM_ID = UUID.fromString("00000000-0000-0000-0000-000000001001");
	private static final UUID RULE_ID = UUID.fromString("00000000-0000-0000-0000-000000001002");
	private static final UUID MATCH_ID = UUID.fromString("00000000-0000-0000-0000-000000001003");
	private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000001004");
	private static final OffsetDateTime OBSERVED_AT = OffsetDateTime.parse("2026-05-19T01:30:00Z");

	@Mock private StarLobbyRepository repository;
	@Mock private StarLobbyRealtimePublisher realtimePublisher;
	@Mock private StarLobbyDiscordWebhookNotifier discordWebhookNotifier;
	@Mock private StarLobbySecretProtector secretProtector;
	private StarLobbyService service;

	@BeforeEach void setUp() {
		service = new StarLobbyService(repository, realtimePublisher, discordWebhookNotifier, secretProtector);
	}

	@Test void 관측방제가기존키워드조건과맞으면매칭을저장한다() {
		var room = new StarLobbyRepository.ObservedRoomRow(ROOM_ID, "랜타디초보환영|3|6", "랜타디 초보 환영", 3, 6, "observed", OBSERVED_AT, OBSERVED_AT, null, null);
		var rule = new StarLobbyRepository.AlertRuleRow(RULE_ID, USER_ID, null, "랜타디", List.of("랜타디", "RTD"), List.of("고수"), null, null, true, OBSERVED_AT, OBSERVED_AT);
		var match = new StarLobbyRepository.AlertMatchRow(MATCH_ID, RULE_ID, ROOM_ID, "matched", "랜타디", null, OBSERVED_AT);
		when(repository.upsertObservedRoom(any(), eq("랜타디초보환영|3|6"), eq("랜타디 초보 환영"), eq(3), eq(6), eq(OBSERVED_AT), isNull())).thenReturn(room);
		when(repository.markMissingRoomsDisappeared(java.util.Set.of("랜타디초보환영|3|6"), OBSERVED_AT)).thenReturn(List.of());
		when(repository.listEnabledAlertRules()).thenReturn(List.of(rule));
		when(repository.insertAlertMatchIfAbsent(any(), eq(RULE_ID), eq(ROOM_ID), eq("matched"), eq("랜타디"), isNull(), eq(OBSERVED_AT))).thenReturn(match);

		var result = service.ingestObservation(new IngestObservationRequest(OBSERVED_AT, List.of(new ObservationRoomRequest("랜타디 초보 환영", 3, 6, null))));

		assertThat(result.matches()).hasSize(1);
		assertThat(result.matches().getFirst().matchedKeyword()).isEqualTo("랜타디");
		verify(repository).markMissingRoomsDisappeared(java.util.Set.of("랜타디초보환영|3|6"), OBSERVED_AT);
		verify(realtimePublisher).publishAfterCommit(argThat(events -> events.size() == 2
			&& events.stream().anyMatch(event -> "room_observed".equals(event.type()) && event.room().id().equals(ROOM_ID))
			&& events.stream().anyMatch(event -> "alert_matched".equals(event.type()) && event.recipient().ownerUserId().equals(USER_ID))));
	}

	@Test void 제외키워드가있으면사용자알림매칭으로반환하지않는다() {
		var room = new StarLobbyRepository.ObservedRoomRow(ROOM_ID, "랜타디고수방|3|6", "랜타디 고수방", 3, 6, "observed", OBSERVED_AT, OBSERVED_AT, null, null);
		var rule = new StarLobbyRepository.AlertRuleRow(RULE_ID, USER_ID, null, "랜타디", List.of("랜타디"), List.of("고수"), null, null, true, OBSERVED_AT, OBSERVED_AT);
		var suppressed = new StarLobbyRepository.AlertMatchRow(MATCH_ID, RULE_ID, ROOM_ID, "suppressed", "랜타디", "고수", OBSERVED_AT);
		when(repository.upsertObservedRoom(any(), eq("랜타디고수방|3|6"), eq("랜타디 고수방"), eq(3), eq(6), eq(OBSERVED_AT), isNull())).thenReturn(room);
		when(repository.markMissingRoomsDisappeared(java.util.Set.of("랜타디고수방|3|6"), OBSERVED_AT)).thenReturn(List.of());
		when(repository.listEnabledAlertRules()).thenReturn(List.of(rule));
		when(repository.insertAlertMatchIfAbsent(any(), eq(RULE_ID), eq(ROOM_ID), eq("suppressed"), eq("랜타디"), eq("고수"), eq(OBSERVED_AT))).thenReturn(suppressed);

		var result = service.ingestObservation(new IngestObservationRequest(OBSERVED_AT, List.of(new ObservationRoomRequest("랜타디 고수방", 3, 6, null))));

		assertThat(result.matches()).isEmpty();
	}


	@Test void 사라진방도실시간이벤트로전달한다() {
		var disappeared = new StarLobbyRepository.ObservedRoomRow(ROOM_ID, "랜타디초보환영|3|6", "랜타디 초보 환영", 3, 6, "disappeared", OBSERVED_AT, OBSERVED_AT, OBSERVED_AT, null);
		when(repository.markMissingRoomsDisappeared(java.util.Set.of(), OBSERVED_AT)).thenReturn(List.of(disappeared));

		service.ingestObservation(new IngestObservationRequest(OBSERVED_AT, List.of()));

		verify(realtimePublisher).publishAfterCommit(argThat(events -> events.size() == 1
			&& "room_disappeared".equals(events.getFirst().type())
			&& events.getFirst().room().id().equals(ROOM_ID)));
	}

	@Test void 매칭된조건에디스코드웹훅이있으면알림을예약한다() {
		var room = new StarLobbyRepository.ObservedRoomRow(ROOM_ID, "랜타디초보환영|3|6", "랜타디 초보 환영", 3, 6, "observed", OBSERVED_AT, OBSERVED_AT, null, null);
		var rule = new StarLobbyRepository.AlertRuleRow(RULE_ID, USER_ID, null, "랜타디", List.of("랜타디"), List.of(), null, null, true, OBSERVED_AT, OBSERVED_AT);
		var match = new StarLobbyRepository.AlertMatchRow(MATCH_ID, RULE_ID, ROOM_ID, "matched", "랜타디", null, OBSERVED_AT);
		var webhook = new StarLobbyRepository.DiscordWebhookRow(UUID.randomUUID(), USER_ID, null, "protected", true, OBSERVED_AT, OBSERVED_AT);
		when(repository.upsertObservedRoom(any(), eq("랜타디초보환영|3|6"), eq("랜타디 초보 환영"), eq(3), eq(6), eq(OBSERVED_AT), isNull())).thenReturn(room);
		when(repository.markMissingRoomsDisappeared(java.util.Set.of("랜타디초보환영|3|6"), OBSERVED_AT)).thenReturn(List.of());
		when(repository.listEnabledAlertRules()).thenReturn(List.of(rule));
		when(repository.insertAlertMatchIfAbsent(any(), eq(RULE_ID), eq(ROOM_ID), eq("matched"), eq("랜타디"), isNull(), eq(OBSERVED_AT))).thenReturn(match);
		when(repository.findDiscordWebhook(eq(USER_ID), isNull())).thenReturn(Optional.of(webhook));
		when(secretProtector.reveal("protected")).thenReturn("https://discord.com/api/webhooks/1/token");

		service.ingestObservation(new IngestObservationRequest(OBSERVED_AT, List.of(new ObservationRoomRequest("랜타디 초보 환영", 3, 6, null))));

		verify(discordWebhookNotifier).notifyAfterCommit(argThat(notifications -> notifications.size() == 1
			&& notifications.getFirst().webhookUrl().equals("https://discord.com/api/webhooks/1/token")
			&& notifications.getFirst().content().contains("랜타디 초보 환영")));
	}

	@Test void 디스코드웹훅을저장한다() {
		var row = new StarLobbyRepository.DiscordWebhookRow(UUID.randomUUID(), null, "guest-1", "protected", true, OBSERVED_AT, OBSERVED_AT);
		when(secretProtector.protect("https://discord.com/api/webhooks/1/token")).thenReturn("protected");
		when(repository.upsertDiscordWebhook(any(), isNull(), eq("guest-1"), eq("protected"), any())).thenReturn(row);

		var result = service.upsertDiscordWebhook(null, "guest-1", new DiscordWebhookRequest("https://discord.com/api/webhooks/1/token"));

		assertThat(result.connected()).isTrue();
	}

	@Test void 디스코드전역환경변수없이도운영상태를반환한다() {
		when(secretProtector.hasConfiguredSecret()).thenReturn(false);
		when(repository.countDiscordWebhooks(false)).thenReturn(2L);
		when(repository.countDiscordWebhooks(true)).thenReturn(1L);

		var result = service.getDiscordWebhookAdminStatus();

		assertThat(result.globalDiscordEnvRequired()).isFalse();
		assertThat(result.secretConfigured()).isFalse();
		assertThat(result.registeredWebhookCount()).isEqualTo(2);
		assertThat(result.enabledWebhookCount()).isEqualTo(1);
	}

	@Test void 게스트세션또는로그인없이알림조건을만들수없다() {
		assertThatThrownBy(() -> service.createAlertRule(null, null, new AlertRuleRequest("랜타디", List.of("랜타디"), List.of(), null, null)))
			.isInstanceOf(StarLobbyServiceException.class)
			.hasMessage("알림 조건을 저장하려면 로그인하거나 게스트 세션이 필요합니다.");
	}

	@Test void 알림조건은중복키워드를정규화해서저장한다() {
		var row = new StarLobbyRepository.AlertRuleRow(RULE_ID, null, "guest-1", "랜타디", List.of("랜타디"), List.of("고수"), 2, 6, true, OBSERVED_AT, OBSERVED_AT);
		when(repository.insertAlertRule(any(), isNull(), eq("guest-1"), eq("랜타디"), eq(List.of("랜타디")), eq(List.of("고수")), eq(2), eq(6), any())).thenReturn(row);

		var result = service.createAlertRule(null, "guest-1", new AlertRuleRequest(" 랜타디 ", List.of("랜타디", " 랜타디 "), List.of(" 고수 "), 2, 6));

		assertThat(result.rule().includeKeywords()).containsExactly("랜타디");
	}
	@Test void 알림조건을끌수있다() {
		var current = new StarLobbyRepository.AlertRuleRow(RULE_ID, null, "guest-1", "랜타디", List.of("랜타디"), List.of("고수"), null, null, true, OBSERVED_AT, OBSERVED_AT);
		var updated = new StarLobbyRepository.AlertRuleRow(RULE_ID, null, "guest-1", "랜타디", List.of("랜타디"), List.of("고수"), null, null, false, OBSERVED_AT, OBSERVED_AT);
		when(repository.findAlertRule(isNull(), eq("guest-1"), eq(RULE_ID))).thenReturn(Optional.of(current));
		when(repository.updateAlertRule(eq(RULE_ID), eq("랜타디"), eq(List.of("랜타디")), eq(List.of("고수")), isNull(), isNull(), eq(false), any())).thenReturn(updated);

		var result = service.updateAlertRule(null, "guest-1", RULE_ID, new UpdateAlertRuleRequest(null, null, null, null, null, false));

		assertThat(result.rule().enabled()).isFalse();
	}

	@Test void 내알림조건만삭제한다() {
		when(repository.deleteAlertRule(isNull(), eq("guest-1"), eq(RULE_ID))).thenReturn(1);

		service.deleteAlertRule(null, "guest-1", RULE_ID);

		verify(repository).deleteAlertRule(isNull(), eq("guest-1"), eq(RULE_ID));
	}

	@Test void 없는알림조건삭제는실패한다() {
		when(repository.deleteAlertRule(isNull(), eq("guest-1"), eq(RULE_ID))).thenReturn(0);

		assertThatThrownBy(() -> service.deleteAlertRule(null, "guest-1", RULE_ID))
			.isInstanceOf(StarLobbyServiceException.class)
			.hasMessage("알림 조건을 찾지 못했습니다.");
	}

}
