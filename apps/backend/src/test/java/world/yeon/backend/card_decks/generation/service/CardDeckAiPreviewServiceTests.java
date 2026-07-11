package world.yeon.backend.card_decks.generation.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import world.yeon.backend.card_decks.ai.CardLearningAiGateway;
import world.yeon.backend.card_decks.ai_usage.service.CardAiRequestUsageService;
import world.yeon.backend.card_decks.generation.dto.CardDeckAiPreviewRequest;

@ExtendWith(MockitoExtension.class)
class CardDeckAiPreviewServiceTests {
	private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000977");
	private static final UUID USAGE_ID = UUID.fromString("00000000-0000-0000-0000-000000000976");
	private static final UUID EXECUTION_ID = UUID.fromString("00000000-0000-0000-0000-000000000975");
	private static final String IDEMPOTENCY_KEY = "f410b971-69cc-4e08-a392-d695f21e9658";

	@Mock private CardLearningAiGateway aiGateway;
	@Mock private CardAiRequestUsageService usageService;
	private CardDeckAiPreviewService service;

	@BeforeEach void setUp() {
		service = new CardDeckAiPreviewService(aiGateway, usageService, new ObjectMapper());
	}

	@Test void AI결과를검증하고사용량과함께저장한다() {
		when(usageService.reserve(any(), any(), anyString(), anyString())).thenReturn(
			new CardAiRequestUsageService.Reservation(
				CardAiRequestUsageService.ReservationState.NEW, USAGE_ID, EXECUTION_ID, null, null
			)
		);
		when(aiGateway.generateDeck("학습 원문", "핵심 위주", 2)).thenReturn(
			new CardLearningAiGateway.GeneratedDeck(
				"생성 덱", null,
				List.of(
					new CardLearningAiGateway.GeneratedCard("질문 1", "정답 1"),
					new CardLearningAiGateway.GeneratedCard("질문 2", "정답 2")
				),
				"glm-test", 120, 80, 55
			)
		);

		var result = service.create(USER_ID, new CardDeckAiPreviewRequest(
			IDEMPOTENCY_KEY, " 학습 원문 ", " 핵심 위주 ", 2
		));

		assertThat(result.title()).isEqualTo("생성 덱");
		assertThat(result.items()).hasSize(2);
		verify(usageService).markSuccess(
			eq(USAGE_ID), eq(EXECUTION_ID), eq("glm-test"), eq(120), eq(80), eq(55L), anyString()
		);
	}

	@Test void 같은질문을중복생성하면실패로기록한다() {
		when(usageService.reserve(any(), any(), anyString(), anyString())).thenReturn(
			new CardAiRequestUsageService.Reservation(
				CardAiRequestUsageService.ReservationState.NEW, USAGE_ID, EXECUTION_ID, null, null
			)
		);
		when(aiGateway.generateDeck(anyString(), any(), eq(2))).thenReturn(
			new CardLearningAiGateway.GeneratedDeck(
				"덱", null,
				List.of(
					new CardLearningAiGateway.GeneratedCard("같은 질문", "답 1"),
					new CardLearningAiGateway.GeneratedCard("같은 질문", "답 2")
				),
				"glm-test", null, null, 10
			)
		);

		assertThatThrownBy(() -> service.create(USER_ID, new CardDeckAiPreviewRequest(
			IDEMPOTENCY_KEY, "원문", null, 2
		)))
			.isInstanceOf(CardDeckAiPreviewException.class)
			.hasMessage("AI가 생성한 카드 덱 형식이 올바르지 않습니다.");
		verify(usageService).markFailed(USAGE_ID, EXECUTION_ID, "CARD_DECK_AI_RESPONSE_INVALID");
	}

	@Test void 잘못된입력은AI를호출하지않는다() {
		assertThatThrownBy(() -> service.create(USER_ID, new CardDeckAiPreviewRequest(
			"not-uuid", "원문", null, 2
		)))
			.isInstanceOf(CardDeckAiPreviewException.class)
			.hasMessage("멱등성 키 형식이 올바르지 않습니다.");
		verify(aiGateway, never()).generateDeck(any(), any(), any(Integer.class));
	}

	@Test void 너무긴AI제목은호출자오류가아닌상류응답오류다() {
		when(usageService.reserve(any(), any(), anyString(), anyString())).thenReturn(
			new CardAiRequestUsageService.Reservation(
				CardAiRequestUsageService.ReservationState.NEW, USAGE_ID, EXECUTION_ID, null, null
			)
		);
		when(aiGateway.generateDeck(anyString(), any(), eq(1))).thenReturn(
			new CardLearningAiGateway.GeneratedDeck(
				"가".repeat(121), null,
				List.of(new CardLearningAiGateway.GeneratedCard("질문", "답")),
				"glm-test", null, null, 10
			)
		);

		assertThatThrownBy(() -> service.create(USER_ID, new CardDeckAiPreviewRequest(
			IDEMPOTENCY_KEY, "원문", null, 1
		)))
			.isInstanceOfSatisfying(CardDeckAiPreviewException.class, error -> {
				assertThat(error.status()).isEqualTo(502);
				assertThat(error.code()).isEqualTo("CARD_DECK_AI_RESPONSE_INVALID");
			});
		verify(usageService).markFailed(USAGE_ID, EXECUTION_ID, "CARD_DECK_AI_RESPONSE_INVALID");
	}

	@Test void 너무긴AI설명도상류응답오류다() {
		when(usageService.reserve(any(), any(), anyString(), anyString())).thenReturn(
			new CardAiRequestUsageService.Reservation(
				CardAiRequestUsageService.ReservationState.NEW, USAGE_ID, EXECUTION_ID, null, null
			)
		);
		when(aiGateway.generateDeck(anyString(), any(), eq(1))).thenReturn(
			new CardLearningAiGateway.GeneratedDeck(
				"덱", "가".repeat(2_001),
				List.of(new CardLearningAiGateway.GeneratedCard("질문", "답")),
				"glm-test", null, null, 10
			)
		);

		assertThatThrownBy(() -> service.create(USER_ID, new CardDeckAiPreviewRequest(
			IDEMPOTENCY_KEY, "원문", null, 1
		)))
			.isInstanceOfSatisfying(CardDeckAiPreviewException.class, error -> {
				assertThat(error.status()).isEqualTo(502);
				assertThat(error.code()).isEqualTo("CARD_DECK_AI_RESPONSE_INVALID");
			});
		verify(usageService).markFailed(USAGE_ID, EXECUTION_ID, "CARD_DECK_AI_RESPONSE_INVALID");
	}

	@Test void 시간창한도를넘은요청은429다() {
		when(usageService.reserve(any(), any(), anyString(), anyString())).thenReturn(
			new CardAiRequestUsageService.Reservation(
				CardAiRequestUsageService.ReservationState.RATE_LIMITED, null, null, null
			)
		);

		assertThatThrownBy(() -> service.create(USER_ID, new CardDeckAiPreviewRequest(
			IDEMPOTENCY_KEY, "원문", null, 2
		)))
			.isInstanceOfSatisfying(CardDeckAiPreviewException.class, error -> {
				assertThat(error.status()).isEqualTo(429);
				assertThat(error.code()).isEqualTo("CARD_DECK_AI_RATE_LIMITED");
			});
		verify(aiGateway, never()).generateDeck(any(), any(), any(Integer.class));
	}
}
