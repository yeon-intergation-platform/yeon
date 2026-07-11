package world.yeon.backend.card_decks.ai_usage.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import world.yeon.backend.card_decks.ai_usage.domain.CardAiFeature;
import world.yeon.backend.card_decks.ai_usage.repository.CardAiRequestUsageRepository;

@ExtendWith(MockitoExtension.class)
class CardAiRequestUsageServiceTests {
	private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000979");
	private static final UUID USAGE_ID = UUID.fromString("00000000-0000-0000-0000-000000000978");

	@Mock private CardAiRequestUsageRepository repository;
	private CardAiRequestUsageService service;

	@BeforeEach void setUp() {
		service = new CardAiRequestUsageService(
			repository,
			new CardAiGlobalBudgetPolicy(true, 1_000, 5_000_000)
		);
	}

	@Test void 같은키와같은지문이면성공결과를재사용한다() {
		when(repository.findByIdempotencyKey(USER_ID, "recall_grade", "key"))
			.thenReturn(new CardAiRequestUsageRepository.UsageRow(
				USAGE_ID, USER_ID, "recall_grade", "key", "fingerprint", "success",
				"{\"score\":90}", null, OffsetDateTime.parse("2026-07-11T00:00:00Z"),
				OffsetDateTime.parse("2026-07-11T00:00:00Z")
			));

		var result = service.reserve(USER_ID, CardAiFeature.RECALL_GRADE, "key", "fingerprint");

		assertThat(result.state()).isEqualTo(CardAiRequestUsageService.ReservationState.REPLAY_SUCCESS);
		assertThat(result.responsePayload()).isEqualTo("{\"score\":90}");
		verify(repository, never()).countExecutionsSince(any(), any(), any());
	}

	@Test void 같은키를다른본문에사용하면충돌이다() {
		when(repository.findByIdempotencyKey(USER_ID, "card_deck_generate", "key"))
			.thenReturn(new CardAiRequestUsageRepository.UsageRow(
				USAGE_ID, USER_ID, "card_deck_generate", "key", "original", "success",
				"{}", null, OffsetDateTime.parse("2026-07-11T00:00:00Z"),
				OffsetDateTime.parse("2026-07-11T00:00:00Z")
			));

		var result = service.reserve(USER_ID, CardAiFeature.DECK_GENERATION, "key", "changed");

		assertThat(result.state()).isEqualTo(CardAiRequestUsageService.ReservationState.CONFLICT);
	}

	@Test void 시간창한도를넘으면새요청을예약하지않는다() {
		permitGlobalBudget(0, 0);
		when(repository.findByIdempotencyKey(USER_ID, "card_deck_generate", "key")).thenReturn(null);
		when(repository.countExecutionsSince(any(), any(), any())).thenReturn(CardAiFeature.DECK_GENERATION.limit());

		var result = service.reserve(USER_ID, CardAiFeature.DECK_GENERATION, "key", "fingerprint");

		assertThat(result.state()).isEqualTo(CardAiRequestUsageService.ReservationState.RATE_LIMITED);
		verify(repository, never()).insertPending(any(), any(), any(), any(), any(), any(), any());
	}

	@Test void 실패한동일요청은실행횟수를추가하고같은행으로재시도한다() {
		permitGlobalBudget(0, 0);
		OffsetDateTime failedAt = OffsetDateTime.now().minusSeconds(10);
		when(repository.findByIdempotencyKey(USER_ID, "recall_grade", "key"))
			.thenReturn(new CardAiRequestUsageRepository.UsageRow(
				USAGE_ID, USER_ID, "recall_grade", "key", "fingerprint", "failed",
				null, "ZAI_TIMEOUT", failedAt, failedAt
			));
		when(repository.restartFailed(eq(USAGE_ID), any(), any())).thenReturn(true);

		var result = service.reserve(USER_ID, CardAiFeature.RECALL_GRADE, "key", "fingerprint");

		assertThat(result.state()).isEqualTo(CardAiRequestUsageService.ReservationState.NEW);
		assertThat(result.usageId()).isEqualTo(USAGE_ID);
		verify(repository).restartFailed(eq(USAGE_ID), any(), any());
		verify(repository).insertExecution(
			any(), eq(USAGE_ID), eq(USER_ID), eq("recall_grade"),
			eq(CardAiFeature.RECALL_GRADE.maximumReservedTokens()), any()
		);
	}

	@Test void 실패재시도도시간창한도를적용한다() {
		permitGlobalBudget(0, 0);
		OffsetDateTime failedAt = OffsetDateTime.now().minusSeconds(10);
		when(repository.findByIdempotencyKey(USER_ID, "recall_grade", "key"))
			.thenReturn(new CardAiRequestUsageRepository.UsageRow(
				USAGE_ID, USER_ID, "recall_grade", "key", "fingerprint", "failed",
				null, "ZAI_TIMEOUT", failedAt, failedAt
			));
		when(repository.countExecutionsSince(any(), any(), any())).thenReturn(CardAiFeature.RECALL_GRADE.limit());

		var result = service.reserve(USER_ID, CardAiFeature.RECALL_GRADE, "key", "fingerprint");

		assertThat(result.state()).isEqualTo(CardAiRequestUsageService.ReservationState.RATE_LIMITED);
		verify(repository, never()).restartFailed(any(), any(), any());
		verify(repository, never()).insertExecution(any(), any(), any(), any(), anyInt(), any());
	}

	@Test void 이분넘은pending요청은같은사용량행을재점유한다() {
		permitGlobalBudget(0, 0);
		OffsetDateTime stale = OffsetDateTime.now().minusMinutes(3);
		when(repository.findByIdempotencyKey(USER_ID, "recall_grade", "key"))
			.thenReturn(new CardAiRequestUsageRepository.UsageRow(
				USAGE_ID, USER_ID, "recall_grade", "key", "fingerprint", "pending",
				null, null, stale, stale
			));
		when(repository.restartPending(eq(USAGE_ID), any(), any(), any())).thenReturn(true);

		var result = service.reserve(USER_ID, CardAiFeature.RECALL_GRADE, "key", "fingerprint");

		assertThat(result.state()).isEqualTo(CardAiRequestUsageService.ReservationState.NEW);
		assertThat(result.usageId()).isEqualTo(USAGE_ID);
		verify(repository).restartPending(eq(USAGE_ID), any(), any(), any());
		verify(repository).insertExecution(
			any(), eq(USAGE_ID), eq(USER_ID), eq("recall_grade"),
			eq(CardAiFeature.RECALL_GRADE.maximumReservedTokens()), any()
		);
	}

	@Test void 만료되지않은pending요청은진행중으로유지한다() {
		OffsetDateTime recent = OffsetDateTime.now().minusSeconds(30);
		when(repository.findByIdempotencyKey(USER_ID, "recall_grade", "key"))
			.thenReturn(new CardAiRequestUsageRepository.UsageRow(
				USAGE_ID, USER_ID, "recall_grade", "key", "fingerprint", "pending",
				null, null, recent, recent
			));

		var result = service.reserve(USER_ID, CardAiFeature.RECALL_GRADE, "key", "fingerprint");

		assertThat(result.state()).isEqualTo(CardAiRequestUsageService.ReservationState.PENDING);
		verify(repository, never()).restartPending(any(), any(), any(), any());
	}

	@Test void 전역토큰예산에서기능별최대예약량까지확보할수없으면차단한다() {
		service = new CardAiRequestUsageService(
			repository,
			new CardAiGlobalBudgetPolicy(true, 1_000, 64_000)
		);
		permitGlobalBudget(0, 1);
		when(repository.findByIdempotencyKey(USER_ID, "recall_grade", "key")).thenReturn(null);

		var result = service.reserve(USER_ID, CardAiFeature.RECALL_GRADE, "key", "fingerprint");

		assertThat(result.state()).isEqualTo(CardAiRequestUsageService.ReservationState.GLOBAL_BUDGET_EXHAUSTED);
		verify(repository, never()).insertPending(any(), any(), any(), any(), any(), any(), any());
	}

	@Test void 운영킬스위치가꺼지면외부AI호출전예약을거부한다() {
		service = new CardAiRequestUsageService(
			repository,
			new CardAiGlobalBudgetPolicy(false, 1_000, 5_000_000)
		);
		when(repository.findByIdempotencyKey(USER_ID, "recall_grade", "key")).thenReturn(null);

		var result = service.reserve(USER_ID, CardAiFeature.RECALL_GRADE, "key", "fingerprint");

		assertThat(result.state()).isEqualTo(CardAiRequestUsageService.ReservationState.AI_DISABLED);
		verify(repository, never()).insertPending(any(), any(), any(), any(), any(), any(), any());
	}

	@Test void 현재실행식별자로성공처리하고실제토큰사용량을같이기록한다() {
		UUID executionId = UUID.fromString("00000000-0000-0000-0000-000000000977");

		service.markSuccess(
			USAGE_ID,
			executionId,
			"glm-4.5-flash",
			120,
			80,
			250,
			"{}"
		);

		verify(repository).markSuccess(
			eq(USAGE_ID),
			eq(executionId),
			eq("glm-4.5-flash"),
			eq(120),
			eq(80),
			eq(250L),
			eq("{}"),
			any()
		);
		verify(repository).markExecutionActualTokens(executionId, 120, 80);
	}

	@Test void 현재실행식별자로만실패처리한다() {
		UUID executionId = UUID.fromString("00000000-0000-0000-0000-000000000977");

		service.markFailed(USAGE_ID, executionId, "ZAI_TIMEOUT");

		verify(repository).markFailed(eq(USAGE_ID), eq(executionId), eq("ZAI_TIMEOUT"), any());
	}

	private void permitGlobalBudget(long requestCount, long tokenCount) {
		when(repository.readGlobalBudgetUsageSince(any())).thenReturn(
			new CardAiRequestUsageRepository.GlobalBudgetUsage(requestCount, tokenCount)
		);
	}
}
