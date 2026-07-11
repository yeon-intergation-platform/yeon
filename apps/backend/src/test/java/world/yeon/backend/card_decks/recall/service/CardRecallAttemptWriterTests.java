package world.yeon.backend.card_decks.recall.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
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
import world.yeon.backend.card_decks.recall.repository.CardRecallRepository;

@ExtendWith(MockitoExtension.class)
class CardRecallAttemptWriterTests {
	private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000975");
	private static final UUID USAGE_ID = UUID.fromString("00000000-0000-0000-0000-000000000976");
	private static final UUID EXECUTION_ID = UUID.fromString("00000000-0000-0000-0000-000000000977");
	private static final OffsetDateTime UPDATED_AT = OffsetDateTime.parse("2026-07-11T00:00:00Z");
	private static final CardRecallRepository.OwnedCard CARD = new CardRecallRepository.OwnedCard(
		1L, 2L, "dck_1", "dki_1", "질문", "정답", UPDATED_AT
	);

	@Mock private CardRecallRepository repository;
	@Mock private CardAiRequestUsageService usageService;
	private CardRecallAttemptWriter writer;

	@BeforeEach void setUp() {
		writer = new CardRecallAttemptWriter(repository, usageService, new ObjectMapper());
	}

	@Test void 통과채점과SRS를하나의writer호출로저장한다() {
		when(repository.findAttemptByIdempotencyKey(USER_ID, "key")).thenReturn(null);
		when(repository.lockOwnedCard(USER_ID, "dck_1", "dki_1")).thenReturn(CARD);
		when(repository.insertAttempt(
			any(), eq(USER_ID), eq(CARD), eq("key"), eq("사용자 답"), eq(91), eq("pass"),
			any(), eq("잘했습니다."), eq("good"), any(), any(), eq("glm-test"), any()
		)).thenAnswer(invocation -> new CardRecallRepository.AttemptRow(
			invocation.getArgument(0), "dck_1", "dki_1", "질문", "정답", "사용자 답",
			91, "pass", List.of(), "잘했습니다.", "good",
			invocation.getArgument(10), invocation.getArgument(11), invocation.getArgument(13)
		));

		var result = writer.complete(USER_ID, CARD, "사용자 답", "key", USAGE_ID, EXECUTION_ID,
			new CardLearningAiGateway.GradeResult(91, "fail", List.of(), "잘했습니다.", "glm-test", 10, 5, 20));

		assertThat(result.verdict()).isEqualTo("pass");
		assertThat(result.reviewDifficulty()).isEqualTo("good");
		verify(repository).updateItemReview(eq(2L), eq("good"), any(), any());
	}

	@Test void 채점중카드내용이바뀌면아무것도저장하지않는다() {
		when(repository.findAttemptByIdempotencyKey(USER_ID, "key")).thenReturn(null);
		when(repository.lockOwnedCard(USER_ID, "dck_1", "dki_1")).thenReturn(
			new CardRecallRepository.OwnedCard(1L, 2L, "dck_1", "dki_1", "바뀐 질문", "정답", UPDATED_AT.plusSeconds(1))
		);

		assertThatThrownBy(() -> writer.complete(USER_ID, CARD, "사용자 답", "key", USAGE_ID, EXECUTION_ID,
			new CardLearningAiGateway.GradeResult(91, "pass", List.of(), "좋음", "glm-test", null, null, 20)))
			.isInstanceOf(CardRecallServiceException.class)
			.hasMessage("채점 중 카드 내용이 변경되었습니다. 최신 내용으로 다시 시도해 주세요.");
		verify(repository, never()).insertAttempt(any(), any(), any(), any(), any(), any(Integer.class), any(), any(), any(), any(), any(), any(), any(), any());
		verify(repository, never()).updateItemReview(any(Long.class), any(), any(), any());
	}

	@Test void 다른복습의SRS갱신만있으면채점결과를저장한다() {
		when(repository.findAttemptByIdempotencyKey(USER_ID, "key")).thenReturn(null);
		var reviewedCard = new CardRecallRepository.OwnedCard(
			1L, 2L, "dck_1", "dki_1", "질문", "정답", UPDATED_AT.plusSeconds(1)
		);
		when(repository.lockOwnedCard(USER_ID, "dck_1", "dki_1")).thenReturn(reviewedCard);
		when(repository.insertAttempt(
			any(), eq(USER_ID), eq(reviewedCard), eq("key"), eq("사용자 답"), eq(91), eq("pass"),
			any(), eq("잘했습니다."), eq("good"), any(), any(), eq("glm-test"), any()
		)).thenAnswer(invocation -> new CardRecallRepository.AttemptRow(
			invocation.getArgument(0), "dck_1", "dki_1", "질문", "정답", "사용자 답",
			91, "pass", List.of(), "잘했습니다.", "good",
			invocation.getArgument(10), invocation.getArgument(11), invocation.getArgument(13)
		));

		var result = writer.complete(USER_ID, CARD, "사용자 답", "key", USAGE_ID, EXECUTION_ID,
			new CardLearningAiGateway.GradeResult(91, "pass", List.of(), "잘했습니다.", "glm-test", null, null, 20));

		assertThat(result.verdict()).isEqualTo("pass");
		verify(repository).updateItemReview(eq(2L), eq("good"), any(), any());
	}
}
