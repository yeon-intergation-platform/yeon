package world.yeon.backend.star_lobby.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import world.yeon.backend.star_lobby.dto.StarLobbyDtos.*;
import world.yeon.backend.star_lobby.service.StarLobbyService;
import world.yeon.backend.star_lobby.service.StarLobbyServiceException;

@WebMvcTest(StarLobbyController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class StarLobbyControllerTests {
	private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000001101");
	private static final UUID ROOM_ID = UUID.fromString("00000000-0000-0000-0000-000000001102");
	private static final UUID RULE_ID = UUID.fromString("00000000-0000-0000-0000-000000001103");
	private static final OffsetDateTime NOW = OffsetDateTime.parse("2026-05-19T01:40:00Z");

	@Autowired private MockMvc mockMvc;
	@MockitoBean private StarLobbyService service;

	@Test void 최근관측방목록을반환한다() throws Exception {
		when(service.listRecentRooms()).thenReturn(new RoomListResponse(List.of(new ObservedRoomResponse(ROOM_ID, "랜타디 초보", 3, 6, "observed", NOW, NOW, null, List.of(), null)), NOW));

		mockMvc.perform(get("/api/v1/star-lobby/rooms"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.rooms[0].title").value("랜타디 초보"));
	}

	@Test void 관측스냅샷을수집한다() throws Exception {
		var request = new IngestObservationRequest(NOW, List.of(new ObservationRoomRequest("랜타디 초보", 3, 6, null)));
		when(service.ingestObservation(eq(request))).thenReturn(new ObservationIngestResponse(List.of(new ObservedRoomResponse(ROOM_ID, "랜타디 초보", 3, 6, "observed", NOW, NOW, null, List.of(), null)), List.of(), NOW));

		mockMvc.perform(post("/api/v1/star-lobby/observations")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"observedAt\":\"2026-05-19T01:40:00Z\",\"rooms\":[{\"title\":\"랜타디 초보\",\"currentPlayers\":3,\"maxPlayers\":6}]}"))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.rooms[0].currentPlayers").value(3));
	}

	@Test void 게스트알림조건을생성한다() throws Exception {
		var request = new AlertRuleRequest("랜타디", List.of("랜타디"), List.of("고수"), null, null);
		when(service.createAlertRule(isNull(), eq("guest-1"), eq(request))).thenReturn(new AlertRuleMutationResponse(new AlertRuleResponse(RULE_ID, "랜타디", List.of("랜타디"), List.of("고수"), null, null, true, NOW, NOW)));

		mockMvc.perform(post("/api/v1/star-lobby/alert-rules")
				.header("X-Yeon-Guest-Session-Id", "guest-1")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"name\":\"랜타디\",\"includeKeywords\":[\"랜타디\"],\"excludeKeywords\":[\"고수\"]}"))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.rule.includeKeywords[0]").value("랜타디"));
	}

	@Test void 사용자알림조건목록을반환한다() throws Exception {
		when(service.listAlertRules(eq(USER_ID), isNull())).thenReturn(new AlertRuleListResponse(List.of(new AlertRuleResponse(RULE_ID, "랜타디", List.of("랜타디"), List.of(), null, null, true, NOW, NOW))));

		mockMvc.perform(get("/api/v1/star-lobby/alert-rules").header("X-Yeon-User-Id", USER_ID.toString()))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.rules[0].name").value("랜타디"));
	}

	@Test void 게스트알림조건을끄거나켠다() throws Exception {
		var request = new UpdateAlertRuleRequest(null, null, null, null, null, false);
		when(service.updateAlertRule(isNull(), eq("guest-1"), eq(RULE_ID), eq(request)))
			.thenReturn(new AlertRuleMutationResponse(new AlertRuleResponse(RULE_ID, "랜타디", List.of("랜타디"), List.of(), null, null, false, NOW, NOW)));

		mockMvc.perform(patch("/api/v1/star-lobby/alert-rules/{ruleId}", RULE_ID)
				.header("X-Yeon-Guest-Session-Id", "guest-1")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"enabled\":false}"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.rule.enabled").value(false));
	}

	@Test void 게스트알림조건을삭제한다() throws Exception {
		mockMvc.perform(delete("/api/v1/star-lobby/alert-rules/{ruleId}", RULE_ID)
				.header("X-Yeon-Guest-Session-Id", "guest-1"))
			.andExpect(status().isNoContent());

		verify(service).deleteAlertRule(isNull(), eq("guest-1"), eq(RULE_ID));
	}

	@Test void 서비스오류를반환한다() throws Exception {
		when(service.listAlertRules(isNull(), isNull())).thenThrow(new StarLobbyServiceException(401, "STAR_LOBBY_OWNER_REQUIRED", "알림 조건을 저장하려면 로그인하거나 게스트 세션이 필요합니다."));

		mockMvc.perform(get("/api/v1/star-lobby/alert-rules"))
			.andExpect(status().isUnauthorized())
			.andExpect(jsonPath("$.code").value("STAR_LOBBY_OWNER_REQUIRED"));
	}
}
