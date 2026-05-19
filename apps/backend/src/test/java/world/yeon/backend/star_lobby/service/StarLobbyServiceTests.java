package world.yeon.backend.star_lobby.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import world.yeon.backend.star_lobby.dto.StarLobbyDtos.AlertRuleRequest;
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
	private StarLobbyService service;

	@BeforeEach void setUp() {
		service = new StarLobbyService(repository);
	}

	@Test void 관측방제가기존키워드조건과맞으면매칭을저장한다() {
		var room = new StarLobbyRepository.ObservedRoomRow(ROOM_ID, "랜타디초보환영|3|6", "랜타디 초보 환영", 3, 6, "observed", OBSERVED_AT, OBSERVED_AT, null, null);
		var rule = new StarLobbyRepository.AlertRuleRow(RULE_ID, USER_ID, null, "랜타디", List.of("랜타디", "RTD"), List.of("고수"), null, null, true, OBSERVED_AT, OBSERVED_AT);
		var match = new StarLobbyRepository.AlertMatchRow(MATCH_ID, RULE_ID, ROOM_ID, "matched", "랜타디", null, OBSERVED_AT);
		when(repository.upsertObservedRoom(any(), eq("랜타디초보환영|3|6"), eq("랜타디 초보 환영"), eq(3), eq(6), eq(OBSERVED_AT), isNull())).thenReturn(room);
		when(repository.listEnabledAlertRules()).thenReturn(List.of(rule));
		when(repository.insertAlertMatchIfAbsent(any(), eq(RULE_ID), eq(ROOM_ID), eq("matched"), eq("랜타디"), isNull(), eq(OBSERVED_AT))).thenReturn(match);

		var result = service.ingestObservation(new IngestObservationRequest(OBSERVED_AT, List.of(new ObservationRoomRequest("랜타디 초보 환영", 3, 6, null))));

		assertThat(result.matches()).hasSize(1);
		assertThat(result.matches().getFirst().matchedKeyword()).isEqualTo("랜타디");
		verify(repository).markMissingRoomsDisappeared(java.util.Set.of("랜타디초보환영|3|6"), OBSERVED_AT);
	}

	@Test void 제외키워드가있으면사용자알림매칭으로반환하지않는다() {
		var room = new StarLobbyRepository.ObservedRoomRow(ROOM_ID, "랜타디고수방|3|6", "랜타디 고수방", 3, 6, "observed", OBSERVED_AT, OBSERVED_AT, null, null);
		var rule = new StarLobbyRepository.AlertRuleRow(RULE_ID, USER_ID, null, "랜타디", List.of("랜타디"), List.of("고수"), null, null, true, OBSERVED_AT, OBSERVED_AT);
		var suppressed = new StarLobbyRepository.AlertMatchRow(MATCH_ID, RULE_ID, ROOM_ID, "suppressed", "랜타디", "고수", OBSERVED_AT);
		when(repository.upsertObservedRoom(any(), eq("랜타디고수방|3|6"), eq("랜타디 고수방"), eq(3), eq(6), eq(OBSERVED_AT), isNull())).thenReturn(room);
		when(repository.listEnabledAlertRules()).thenReturn(List.of(rule));
		when(repository.insertAlertMatchIfAbsent(any(), eq(RULE_ID), eq(ROOM_ID), eq("suppressed"), eq("랜타디"), eq("고수"), eq(OBSERVED_AT))).thenReturn(suppressed);

		var result = service.ingestObservation(new IngestObservationRequest(OBSERVED_AT, List.of(new ObservationRoomRequest("랜타디 고수방", 3, 6, null))));

		assertThat(result.matches()).isEmpty();
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
}
