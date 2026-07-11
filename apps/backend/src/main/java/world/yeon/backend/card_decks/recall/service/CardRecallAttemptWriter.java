package world.yeon.backend.card_decks.recall.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.card_decks.ai.CardLearningAiGateway;
import world.yeon.backend.card_decks.ai_usage.service.CardAiRequestUsageService;
import world.yeon.backend.card_decks.recall.dto.RecallGradeResponse;
import world.yeon.backend.card_decks.recall.repository.CardRecallRepository;

@Service
public class CardRecallAttemptWriter {
	private static final int PASS_SCORE = 70;
	private static final SecureRandom RANDOM = new SecureRandom();
	private static final Base64.Encoder BASE64_URL = Base64.getUrlEncoder().withoutPadding();

	private final CardRecallRepository repository;
	private final CardAiRequestUsageService usageService;
	private final ObjectMapper objectMapper;

	public CardRecallAttemptWriter(
		CardRecallRepository repository,
		CardAiRequestUsageService usageService,
		ObjectMapper objectMapper
	) {
		this.repository = repository;
		this.usageService = usageService;
		this.objectMapper = objectMapper;
	}

	@Transactional
	public RecallGradeResponse complete(
		UUID userId,
		CardRecallRepository.OwnedCard gradedCard,
		String userAnswer,
		String idempotencyKey,
		UUID usageId,
		UUID executionId,
		CardLearningAiGateway.GradeResult grade
	) {
		var existing = repository.findAttemptByIdempotencyKey(userId, idempotencyKey);
		if (existing != null) {
			assertSameRequest(existing, gradedCard, userAnswer);
			RecallGradeResponse response = CardRecallResponses.toGradeResponse(existing);
			markUsageSuccess(usageId, executionId, grade, response);
			return response;
		}

		var lockedCard = repository.lockOwnedCard(
			userId,
			gradedCard.deckPublicId(),
			gradedCard.itemPublicId()
		);
		if (lockedCard == null) {
			throw new CardRecallServiceException(404, "RECALL_CARD_NOT_FOUND", "채점할 카드를 찾지 못했습니다.");
		}
		if (!sameCardVersion(gradedCard, lockedCard)) {
			throw new CardRecallServiceException(
				409,
				"RECALL_CARD_CHANGED",
				"채점 중 카드 내용이 변경되었습니다. 최신 내용으로 다시 시도해 주세요."
			);
		}

		int score = Math.max(0, Math.min(100, grade.score()));
		String verdict = score >= PASS_SCORE ? "pass" : "fail";
		String difficulty = "pass".equals(verdict) ? "good" : "hard";
		OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
		OffsetDateTime nextReviewAt = "good".equals(difficulty) ? now.plusDays(3) : now.plusDays(1);
		List<String> missedPoints = sanitizeMissedPoints(grade.missedPoints());
		String feedback = truncate(grade.feedback(), 4_000);
		String model = requireText(grade.model(), "AI 채점 모델 정보가 비어 있습니다.", 120);

		var attempt = repository.insertAttempt(
			generatePublicId(),
			userId,
			lockedCard,
			idempotencyKey,
			userAnswer,
			score,
			verdict,
			missedPoints,
			feedback,
			difficulty,
			now,
			nextReviewAt,
			model,
			now
		);
		repository.updateItemReview(lockedCard.itemInternalId(), difficulty, now, nextReviewAt);
		RecallGradeResponse response = CardRecallResponses.toGradeResponse(attempt);
		markUsageSuccess(usageId, executionId, grade, response);
		return response;
	}

	private void markUsageSuccess(
		UUID usageId,
		UUID executionId,
		CardLearningAiGateway.GradeResult grade,
		RecallGradeResponse response
	) {
		try {
			usageService.markSuccess(
				usageId,
				executionId,
				grade.model(),
				grade.inputTokens(),
				grade.outputTokens(),
				grade.latencyMs(),
				objectMapper.writeValueAsString(response)
			);
		} catch (JsonProcessingException error) {
			throw new IllegalStateException("백지 채점 AI 사용량 성공 결과를 직렬화하지 못했습니다.", error);
		}
	}

	private void assertSameRequest(
		CardRecallRepository.AttemptRow existing,
		CardRecallRepository.OwnedCard card,
		String userAnswer
	) {
		if (
			!existing.deckPublicId().equals(card.deckPublicId())
				|| !existing.itemPublicId().equals(card.itemPublicId())
				|| !existing.userAnswer().equals(userAnswer)
		) {
			throw new CardRecallServiceException(
				409,
				"RECALL_IDEMPOTENCY_KEY_REUSED",
				"같은 멱등성 키를 다른 채점 요청에 사용할 수 없습니다."
			);
		}
	}

	private boolean sameCardVersion(
		CardRecallRepository.OwnedCard before,
		CardRecallRepository.OwnedCard current
	) {
		return before.question().equals(current.question())
			&& before.answer().equals(current.answer());
	}

	private List<String> sanitizeMissedPoints(List<String> values) {
		if (values == null) return List.of();
		return values.stream()
			.filter(value -> value != null && !value.trim().isEmpty())
			.map(value -> truncate(value.trim(), 1_000))
			.limit(30)
			.toList();
	}

	private String requireText(String value, String message, int maxLength) {
		if (value == null || value.trim().isEmpty()) {
			throw new CardRecallServiceException(502, "RECALL_AI_RESULT_INVALID", message);
		}
		return truncate(value.trim(), maxLength);
	}

	private String truncate(String value, int maxLength) {
		if (value == null) return "";
		return value.length() <= maxLength ? value : value.substring(0, maxLength);
	}

	private String generatePublicId() {
		byte[] bytes = new byte[12];
		RANDOM.nextBytes(bytes);
		return "rca_" + BASE64_URL.encodeToString(bytes);
	}
}
