package world.yeon.backend.card_decks.recall.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import world.yeon.backend.card_decks.ai.CardLearningAiGateway;
import world.yeon.backend.card_decks.ai_usage.service.CardAiRequestUsageService;
import world.yeon.backend.card_decks.recall.dto.CreateRecallAttemptRequest;
import world.yeon.backend.card_decks.recall.dto.RecallGradeResponse;
import world.yeon.backend.card_decks.recall.repository.CardRecallRepository;

@ExtendWith(MockitoExtension.class)
class CardRecallServiceTests {
	private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000974");
	private static final UUID USAGE_ID = UUID.fromString("00000000-0000-0000-0000-000000000973");
	private static final UUID EXECUTION_ID = UUID.fromString("00000000-0000-0000-0000-000000000972");
	private static final String IDEMPOTENCY_KEY = "3c750f10-c56e-4bd1-8644-b500225bed87";
	private static final OffsetDateTime UPDATED_AT = OffsetDateTime.parse("2026-07-11T00:00:00Z");
	private static final CardRecallRepository.OwnedCard CARD = new CardRecallRepository.OwnedCard(
		1L, 2L, "dck_1", "dki_1", "DB 질문", "DB 정답", UPDATED_AT
	);

	@Mock private CardRecallRepository repository;
	@Mock private CardLearningAiGateway aiGateway;
	@Mock private CardAiRequestUsageService usageService;
	@Mock private CardRecallAttemptWriter attemptWriter;
	private CardRecallService service;

	@BeforeEach void setUp() {
		service = new CardRecallService(
			repository,
			aiGateway,
			usageService,
			attemptWriter,
			new ObjectMapper()
		);
	}

	@Test void 질문과정답은클라이언트가아닌소유카드에서읽는다() {
		var request = new CreateRecallAttemptRequest("사용자 답", IDEMPOTENCY_KEY);
		var grade = new CardLearningAiGateway.GradeResult(
			93, "pass", List.of(), "정확합니다.", "glm-test", 20, 10, 100
		);
		var response = response();
		when(repository.findAttemptByIdempotencyKey(USER_ID, IDEMPOTENCY_KEY)).thenReturn(null);
		when(repository.findOwnedCard(USER_ID, "dck_1", "dki_1")).thenReturn(CARD);
		when(usageService.reserve(any(), any(), eq(IDEMPOTENCY_KEY), anyString())).thenReturn(
			new CardAiRequestUsageService.Reservation(
				CardAiRequestUsageService.ReservationState.NEW, USAGE_ID, EXECUTION_ID, null, null
			)
		);
		when(aiGateway.grade("DB 질문", "DB 정답", "사용자 답")).thenReturn(grade);
		when(attemptWriter.complete(USER_ID, CARD, "사용자 답", IDEMPOTENCY_KEY, USAGE_ID, EXECUTION_ID, grade))
			.thenReturn(response);

		assertThat(service.grade(USER_ID, "dck_1", "dki_1", request)).isEqualTo(response);

		verify(aiGateway).grade("DB 질문", "DB 정답", "사용자 답");
		verify(attemptWriter).complete(USER_ID, CARD, "사용자 답", IDEMPOTENCY_KEY, USAGE_ID, EXECUTION_ID, grade);
	}

	@Test void 같은멱등키의저장된시도는AI호출없이반환한다() {
		var existing = new CardRecallRepository.AttemptRow(
			"rca_1", "dck_1", "dki_1", "질문", "정답", "사용자 답", 93, "pass",
			List.of(), "정확합니다.", "good", UPDATED_AT, UPDATED_AT.plusDays(3), UPDATED_AT
		);
		when(repository.findAttemptByIdempotencyKey(USER_ID, IDEMPOTENCY_KEY)).thenReturn(existing);

		var response = service.grade(USER_ID, "dck_1", "dki_1",
			new CreateRecallAttemptRequest("사용자 답", IDEMPOTENCY_KEY));

		assertThat(response.attemptId()).isEqualTo("rca_1");
		verify(aiGateway, never()).grade(any(), any(), any());
	}

	@Test void 텍스트설명없는미디어카드는AI호출전에거절한다() {
		var mediaOnlyCard = new CardRecallRepository.OwnedCard(
			1L, 2L, "dck_1", "dki_1", "<img src='question.png'>", "정답", UPDATED_AT
		);
		when(repository.findAttemptByIdempotencyKey(USER_ID, IDEMPOTENCY_KEY)).thenReturn(null);
		when(repository.findOwnedCard(USER_ID, "dck_1", "dki_1")).thenReturn(mediaOnlyCard);

		assertThatThrownBy(() -> service.grade(
			USER_ID,
			"dck_1",
			"dki_1",
			new CreateRecallAttemptRequest("사용자 답", IDEMPOTENCY_KEY)
		))
			.isInstanceOfSatisfying(CardRecallServiceException.class, error -> {
				assertThat(error.status()).isEqualTo(422);
				assertThat(error.code()).isEqualTo("RECALL_CARD_TEXT_REQUIRED");
			});
		verify(usageService, never()).reserve(any(), any(), anyString(), anyString());
		verify(aiGateway, never()).grade(any(), any(), any());
	}

	@Test void 같은멱등키의다른답안은충돌이다() {
		var existing = new CardRecallRepository.AttemptRow(
			"rca_1", "dck_1", "dki_1", "질문", "정답", "원래 답", 93, "pass",
			List.of(), "정확합니다.", "good", UPDATED_AT, UPDATED_AT.plusDays(3), UPDATED_AT
		);
		when(repository.findAttemptByIdempotencyKey(USER_ID, IDEMPOTENCY_KEY)).thenReturn(existing);

		assertThatThrownBy(() -> service.grade(USER_ID, "dck_1", "dki_1",
			new CreateRecallAttemptRequest("다른 답", IDEMPOTENCY_KEY)))
			.isInstanceOf(CardRecallServiceException.class)
			.hasMessage("같은 멱등성 키를 다른 채점 요청에 사용할 수 없습니다.");
		verify(aiGateway, never()).grade(any(), any(), any());
	}

	@Test void 잘못된멱등키는400도메인오류다() {
		assertThatThrownBy(() -> service.grade(USER_ID, "dck_1", "dki_1",
			new CreateRecallAttemptRequest("답", "invalid")))
			.isInstanceOf(CardRecallServiceException.class)
			.satisfies(error -> assertThat(((CardRecallServiceException) error).status()).isEqualTo(400));
	}

	@Test void 다른사용자의덱이력은404다() {
		when(repository.ownedDeckExists(USER_ID, "dck_other")).thenReturn(false);

		assertThatThrownBy(() -> service.listAttempts(USER_ID, "dck_other", 20))
			.isInstanceOfSatisfying(CardRecallServiceException.class, error -> {
				assertThat(error.status()).isEqualTo(404);
				assertThat(error.code()).isEqualTo("DECK_NOT_FOUND");
			});
		verify(repository, never()).listAttempts(any(), any(), any(Integer.class));
	}

	private RecallGradeResponse response() {
		return new RecallGradeResponse(
			"rca_1", 93, "pass", List.of(), "정확합니다.", "good",
			UPDATED_AT.toInstant().toString(),
			UPDATED_AT.plusDays(3).toInstant().toString(),
			UPDATED_AT.toInstant().toString()
		);
	}
}
