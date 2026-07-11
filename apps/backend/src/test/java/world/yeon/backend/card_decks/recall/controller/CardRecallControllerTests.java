package world.yeon.backend.card_decks.recall.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
import world.yeon.backend.card_decks.recall.dto.CreateRecallAttemptRequest;
import world.yeon.backend.card_decks.recall.dto.RecallAttemptListResponse;
import world.yeon.backend.card_decks.recall.dto.RecallAttemptResponse;
import world.yeon.backend.card_decks.recall.dto.RecallGradeResponse;
import world.yeon.backend.card_decks.recall.service.CardRecallService;
import world.yeon.backend.card_decks.recall.service.CardRecallServiceException;

@WebMvcTest(CardRecallController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class CardRecallControllerTests {
	private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000981");
	private static final String IDEMPOTENCY_KEY = "12a47b3a-5f20-4d25-9601-654f9149562a";

	@Autowired private MockMvc mockMvc;
	@MockitoBean private CardRecallService service;

	@Test void 질문답안을노출하지않는채점요청을받는다() throws Exception {
		var response = new RecallGradeResponse(
			"rca_1",
			92,
			"pass",
			List.of(),
			"핵심을 정확히 작성했습니다.",
			"good",
			"2026-07-11T00:00:00Z",
			"2026-07-14T00:00:00Z",
			"2026-07-11T00:00:00Z"
		);
		when(service.grade(
			eq(USER_ID),
			eq("dck_1"),
			eq("dki_1"),
			eq(new CreateRecallAttemptRequest("사용자 답", IDEMPOTENCY_KEY))
		)).thenReturn(response);

		mockMvc.perform(post("/card-decks/dck_1/items/dki_1/recall-attempts")
			.header("X-Yeon-User-Id", USER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
				{"userAnswer":"사용자 답","idempotencyKey":"12a47b3a-5f20-4d25-9601-654f9149562a"}
				"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.attemptId").value("rca_1"))
			.andExpect(jsonPath("$.score").value(92))
			.andExpect(jsonPath("$.reviewDifficulty").value("good"));
	}

	@Test void 소유덱의시도이력을반환한다() throws Exception {
		var attempt = new RecallAttemptResponse(
			"rca_1", 30, "fail", List.of("핵심"), "보완 필요", "hard",
			"2026-07-11T00:00:00Z", "2026-07-12T00:00:00Z", "2026-07-11T00:00:00Z",
			"dck_1", "dki_1", "질문", "정답", "사용자 답"
		);
		when(service.listAttempts(USER_ID, "dck_1", 10))
			.thenReturn(new RecallAttemptListResponse(List.of(attempt)));

		mockMvc.perform(get("/card-decks/dck_1/recall-attempts?limit=10")
			.header("X-Yeon-User-Id", USER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.attempts[0].question").value("질문"))
			.andExpect(jsonPath("$.attempts[0].answer").value("정답"));
	}

	@Test void 도메인오류상태와코드를보존한다() throws Exception {
		when(service.listAttempts(USER_ID, "missing", 20)).thenThrow(
			new CardRecallServiceException(404, "DECK_NOT_FOUND", "덱을 찾지 못했습니다.")
		);

		mockMvc.perform(get("/card-decks/missing/recall-attempts")
			.header("X-Yeon-User-Id", USER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isNotFound())
			.andExpect(jsonPath("$.code").value("DECK_NOT_FOUND"));
	}
}
