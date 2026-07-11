package world.yeon.backend.card_decks.recall.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import world.yeon.backend.card_decks.ai.CardLearningAiException;
import world.yeon.backend.card_decks.ai.CardLearningAiGateway;
import world.yeon.backend.card_decks.ai_usage.domain.CardAiFeature;
import world.yeon.backend.card_decks.ai_usage.service.CardAiRequestUsageService;
import world.yeon.backend.card_decks.recall.dto.CreateRecallAttemptRequest;
import world.yeon.backend.card_decks.recall.dto.RecallAttemptListResponse;
import world.yeon.backend.card_decks.recall.dto.RecallGradeResponse;
import world.yeon.backend.card_decks.recall.repository.CardRecallRepository;
import world.yeon.backend.card_decks.support.CardRequestIdentity;

@Service
public class CardRecallService {
	private static final Logger log = LoggerFactory.getLogger(CardRecallService.class);
	private static final int CARD_TEXT_MAX_LENGTH = 20_000;
	private static final int HISTORY_LIMIT_MAX = 100;

	private final CardRecallRepository repository;
	private final CardLearningAiGateway aiGateway;
	private final CardAiRequestUsageService usageService;
	private final CardRecallAttemptWriter attemptWriter;
	private final ObjectMapper objectMapper;

	public CardRecallService(
		CardRecallRepository repository,
		CardLearningAiGateway aiGateway,
		CardAiRequestUsageService usageService,
		CardRecallAttemptWriter attemptWriter,
		ObjectMapper objectMapper
	) {
		this.repository = repository;
		this.aiGateway = aiGateway;
		this.usageService = usageService;
		this.attemptWriter = attemptWriter;
		this.objectMapper = objectMapper;
	}

	public RecallGradeResponse grade(
		UUID userId,
		String deckPublicId,
		String itemPublicId,
		CreateRecallAttemptRequest request
	) {
		String deckId = requireText(deckPublicId, "덱 식별자가 올바르지 않습니다.", 200);
		String itemId = requireText(itemPublicId, "카드 식별자가 올바르지 않습니다.", 200);
		String userAnswer = requireText(
			request == null ? null : request.userAnswer(),
			"답변을 입력해 주세요.",
			CARD_TEXT_MAX_LENGTH
		);
		String idempotencyKey;
		try {
			idempotencyKey = CardRequestIdentity.requireUuid(
				request == null ? null : request.idempotencyKey(),
				"멱등성 키 형식이 올바르지 않습니다."
			);
		} catch (IllegalArgumentException error) {
			throw new CardRecallServiceException(
				400,
				"RECALL_REQUEST_INVALID",
				error.getMessage(),
				error
			);
		}

		var existingAttempt = repository.findAttemptByIdempotencyKey(userId, idempotencyKey);
		if (existingAttempt != null) {
			if (
				!existingAttempt.deckPublicId().equals(deckId)
					|| !existingAttempt.itemPublicId().equals(itemId)
					|| !existingAttempt.userAnswer().equals(userAnswer)
			) {
				throw idempotencyConflict();
			}
			return CardRecallResponses.toGradeResponse(existingAttempt);
		}

		var card = repository.findOwnedCard(userId, deckId, itemId);
		if (card == null) {
			throw new CardRecallServiceException(404, "RECALL_CARD_NOT_FOUND", "채점할 카드를 찾지 못했습니다.");
		}
		if (
			!CardRecallTextPolicy.hasGradeableText(card.question())
				|| !CardRecallTextPolicy.hasGradeableText(card.answer())
		) {
			throw new CardRecallServiceException(
				422,
				"RECALL_CARD_TEXT_REQUIRED",
				"AI 채점에는 질문과 정답의 텍스트 또는 이미지 대체 설명이 필요합니다."
			);
		}

		String fingerprint = CardRequestIdentity.fingerprint(deckId, itemId, userAnswer);
		var reservation = usageService.reserve(
			userId,
			CardAiFeature.RECALL_GRADE,
			idempotencyKey,
			fingerprint
		);
		RecallGradeResponse replay = resolveReservation(reservation);
		if (replay != null) return replay;

		try {
			var grade = aiGateway.grade(card.question(), card.answer(), userAnswer);
			RecallGradeResponse response = attemptWriter.complete(
				userId,
				card,
				userAnswer,
				idempotencyKey,
				reservation.usageId(),
				reservation.executionId(),
				grade
			);
			return response;
		} catch (CardLearningAiException error) {
			markUsageFailed(reservation.usageId(), reservation.executionId(), error.code());
			throw new CardRecallServiceException(error.status(), error.code(), error.getMessage(), error);
		} catch (CardRecallServiceException error) {
			markUsageFailed(reservation.usageId(), reservation.executionId(), error.code());
			throw error;
		} catch (RuntimeException error) {
			markUsageFailed(
				reservation.usageId(),
				reservation.executionId(),
				"RECALL_GRADE_FAILED"
			);
			throw new CardRecallServiceException(
				500,
				"RECALL_GRADE_FAILED",
				"백지 채점 결과를 저장하지 못했습니다.",
				error
			);
		}
	}

	public RecallAttemptListResponse listAttempts(UUID userId, String deckPublicId, int limit) {
		String deckId = requireText(deckPublicId, "덱 식별자가 올바르지 않습니다.", 200);
		if (limit < 1 || limit > HISTORY_LIMIT_MAX) {
			throw new CardRecallServiceException(400, "RECALL_HISTORY_LIMIT_INVALID", "조회 개수는 1개 이상 100개 이하여야 합니다.");
		}
		if (!repository.ownedDeckExists(userId, deckId)) {
			throw new CardRecallServiceException(404, "DECK_NOT_FOUND", "덱을 찾지 못했습니다.");
		}
		return new RecallAttemptListResponse(
			repository.listAttempts(userId, deckId, limit).stream()
				.map(CardRecallResponses::toAttemptResponse)
				.toList()
		);
	}

	private RecallGradeResponse resolveReservation(
		CardAiRequestUsageService.Reservation reservation
	) {
		return switch (reservation.state()) {
			case NEW -> null;
			case REPLAY_SUCCESS -> readReplay(reservation.responsePayload());
			case CONFLICT -> throw idempotencyConflict();
			case RATE_LIMITED -> throw new CardRecallServiceException(
				429,
				"RECALL_GRADE_RATE_LIMITED",
				"백지 채점 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요."
			);
			case AI_DISABLED -> throw new CardRecallServiceException(
				503,
				"RECALL_GRADE_AI_DISABLED",
				"백지 AI 채점 기능이 현재 비활성화되어 있습니다."
			);
			case GLOBAL_BUDGET_EXHAUSTED -> throw new CardRecallServiceException(
				429,
				"RECALL_GRADE_GLOBAL_BUDGET_EXHAUSTED",
				"오늘의 백지 AI 채점 사용 한도에 도달했습니다."
			);
			case PENDING -> throw new CardRecallServiceException(
				409,
				"RECALL_GRADE_IN_PROGRESS",
				"같은 채점 요청을 처리하고 있습니다. 잠시 후 다시 확인해 주세요."
			);
			case FAILED -> throw new CardRecallServiceException(
				409,
				"RECALL_GRADE_PREVIOUSLY_FAILED",
				"같은 채점 요청이 이미 실패했습니다. 새 요청으로 다시 시도해 주세요."
			);
		};
	}

	private RecallGradeResponse readReplay(String payload) {
		try {
			return objectMapper.readValue(payload, RecallGradeResponse.class);
		} catch (JsonProcessingException error) {
			throw new CardRecallServiceException(
				500,
				"RECALL_GRADE_REPLAY_INVALID",
				"저장된 채점 결과를 불러오지 못했습니다.",
				error
			);
		}
	}

	private void markUsageFailed(UUID usageId, UUID executionId, String errorCode) {
		try {
			usageService.markFailed(usageId, executionId, errorCode);
		} catch (RuntimeException error) {
			log.warn("백지 채점 AI 사용량 실패 기록을 저장하지 못했습니다. usageId={}", usageId, error);
		}
	}

	private CardRecallServiceException idempotencyConflict() {
		return new CardRecallServiceException(
			409,
			"RECALL_IDEMPOTENCY_KEY_REUSED",
			"같은 멱등성 키를 다른 채점 요청에 사용할 수 없습니다."
		);
	}

	private String requireText(String value, String message, int maxLength) {
		if (value == null || value.trim().isEmpty()) {
			throw new CardRecallServiceException(400, "RECALL_REQUEST_INVALID", message);
		}
		String normalized = value.trim();
		if (normalized.length() > maxLength) {
			throw new CardRecallServiceException(400, "RECALL_REQUEST_INVALID", message);
		}
		return normalized;
	}
}
