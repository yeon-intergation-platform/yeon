package world.yeon.backend.card_decks.generation.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import world.yeon.backend.card_decks.ai.CardLearningAiException;
import world.yeon.backend.card_decks.ai.CardLearningAiGateway;
import world.yeon.backend.card_decks.ai_usage.domain.CardAiFeature;
import world.yeon.backend.card_decks.ai_usage.service.CardAiRequestUsageService;
import world.yeon.backend.card_decks.generation.dto.CardDeckAiDraftItem;
import world.yeon.backend.card_decks.generation.dto.CardDeckAiPreviewRequest;
import world.yeon.backend.card_decks.generation.dto.CardDeckAiPreviewResponse;
import world.yeon.backend.card_decks.support.CardRequestIdentity;

@Service
public class CardDeckAiPreviewService {
	private static final Logger log = LoggerFactory.getLogger(CardDeckAiPreviewService.class);
	private static final int SOURCE_TEXT_MAX_LENGTH = 20_000;
	private static final int INSTRUCTION_MAX_LENGTH = 1_000;
	private static final int ITEM_COUNT_MAX = 30;
	private static final int TITLE_MAX_LENGTH = 120;
	private static final int DESCRIPTION_MAX_LENGTH = 2_000;
	private static final int CARD_TEXT_MAX_LENGTH = 20_000;

	private final CardLearningAiGateway aiGateway;
	private final CardAiRequestUsageService usageService;
	private final ObjectMapper objectMapper;

	public CardDeckAiPreviewService(
		CardLearningAiGateway aiGateway,
		CardAiRequestUsageService usageService,
		ObjectMapper objectMapper
	) {
		this.aiGateway = aiGateway;
		this.usageService = usageService;
		this.objectMapper = objectMapper;
	}

	public CardDeckAiPreviewResponse create(UUID userId, CardDeckAiPreviewRequest request) {
		NormalizedRequest normalized = normalize(request);
		String fingerprint = CardRequestIdentity.fingerprint(
			normalized.sourceText(),
			normalized.instruction(),
			Integer.toString(normalized.itemCount())
		);
		var reservation = usageService.reserve(
			userId,
			CardAiFeature.DECK_GENERATION,
			normalized.idempotencyKey(),
			fingerprint
		);
		CardDeckAiPreviewResponse replay = resolveReservation(reservation);
		if (replay != null) return replay;

		try {
			var generated = aiGateway.generateDeck(
				normalized.sourceText(),
				normalized.instruction(),
				normalized.itemCount()
			);
			CardDeckAiPreviewResponse response = toResponse(generated, normalized.itemCount());
			String payload = objectMapper.writeValueAsString(response);
			usageService.markSuccess(
				reservation.usageId(),
				reservation.executionId(),
				generated.model(),
				generated.inputTokens(),
				generated.outputTokens(),
				generated.latencyMs(),
				payload
			);
			return response;
		} catch (CardLearningAiException error) {
			markFailed(reservation.usageId(), reservation.executionId(), error.code());
			throw new CardDeckAiPreviewException(error.status(), error.code(), error.getMessage(), error);
		} catch (CardDeckAiPreviewException error) {
			markFailed(reservation.usageId(), reservation.executionId(), error.code());
			throw error;
		} catch (JsonProcessingException error) {
			markFailed(
				reservation.usageId(),
				reservation.executionId(),
				"CARD_DECK_AI_RESULT_SERIALIZATION_FAILED"
			);
			throw new CardDeckAiPreviewException(
				500,
				"CARD_DECK_AI_RESULT_SERIALIZATION_FAILED",
				"생성한 카드 덱 결과를 저장하지 못했습니다.",
				error
			);
		} catch (RuntimeException error) {
			markFailed(
				reservation.usageId(),
				reservation.executionId(),
				"CARD_DECK_AI_GENERATION_FAILED"
			);
			throw new CardDeckAiPreviewException(
				500,
				"CARD_DECK_AI_GENERATION_FAILED",
				"AI 카드 덱 생성 요청을 처리하지 못했습니다.",
				error
			);
		}
	}

	private CardDeckAiPreviewResponse resolveReservation(
		CardAiRequestUsageService.Reservation reservation
	) {
		return switch (reservation.state()) {
			case NEW -> null;
			case REPLAY_SUCCESS -> readReplay(reservation.responsePayload());
			case CONFLICT -> throw new CardDeckAiPreviewException(
				409,
				"CARD_DECK_AI_IDEMPOTENCY_KEY_REUSED",
				"같은 멱등성 키를 다른 AI 덱 생성 요청에 사용할 수 없습니다."
			);
			case RATE_LIMITED -> throw new CardDeckAiPreviewException(
				429,
				"CARD_DECK_AI_RATE_LIMITED",
				"AI 카드 덱 생성 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요."
			);
			case AI_DISABLED -> throw new CardDeckAiPreviewException(
				503,
				"CARD_DECK_AI_DISABLED",
				"AI 카드 덱 생성 기능이 현재 비활성화되어 있습니다."
			);
			case GLOBAL_BUDGET_EXHAUSTED -> throw new CardDeckAiPreviewException(
				429,
				"CARD_DECK_AI_GLOBAL_BUDGET_EXHAUSTED",
				"오늘의 AI 카드 덱 생성 사용 한도에 도달했습니다."
			);
			case PENDING -> throw new CardDeckAiPreviewException(
				409,
				"CARD_DECK_AI_IN_PROGRESS",
				"같은 AI 덱 생성 요청을 처리하고 있습니다. 잠시 후 다시 확인해 주세요."
			);
			case FAILED -> throw new CardDeckAiPreviewException(
				409,
				"CARD_DECK_AI_PREVIOUSLY_FAILED",
				"같은 AI 덱 생성 요청이 이미 실패했습니다. 새 요청으로 다시 시도해 주세요."
			);
		};
	}

	private CardDeckAiPreviewResponse readReplay(String payload) {
		try {
			return objectMapper.readValue(payload, CardDeckAiPreviewResponse.class);
		} catch (JsonProcessingException error) {
			throw new CardDeckAiPreviewException(
				500,
				"CARD_DECK_AI_REPLAY_INVALID",
				"저장된 AI 카드 덱 결과를 불러오지 못했습니다.",
				error
			);
		}
	}

	private CardDeckAiPreviewResponse toResponse(
		CardLearningAiGateway.GeneratedDeck generated,
		int requestedItemCount
	) {
		if (generated == null) throw invalidAiResponse();
		String title = requiredAiText(
			generated.title(),
			TITLE_MAX_LENGTH,
			"AI가 생성한 덱 제목이 올바르지 않습니다."
		);
		String description = optionalAiText(
			generated.description(),
			DESCRIPTION_MAX_LENGTH,
			"AI가 생성한 덱 설명이 너무 깁니다."
		);
		if (
			generated.items() == null
				|| generated.items().isEmpty()
				|| generated.items().size() > requestedItemCount
				|| generated.items().size() > ITEM_COUNT_MAX
		) {
			throw invalidAiResponse();
		}

		Set<String> questions = new HashSet<>();
		List<CardDeckAiDraftItem> items = generated.items().stream().map(item -> {
			if (item == null) throw invalidAiResponse();
			String frontText = requiredAiText(
				item.frontText(),
				CARD_TEXT_MAX_LENGTH,
				"AI가 생성한 카드 질문이 올바르지 않습니다."
			);
			String backText = requiredAiText(
				item.backText(),
				CARD_TEXT_MAX_LENGTH,
				"AI가 생성한 카드 답변이 올바르지 않습니다."
			);
			if (!questions.add(frontText)) throw invalidAiResponse();
			return new CardDeckAiDraftItem(frontText, backText);
		}).toList();
		return new CardDeckAiPreviewResponse(title, description, items);
	}

	private NormalizedRequest normalize(CardDeckAiPreviewRequest request) {
		if (request == null) {
			throw invalidRequest("요청 본문을 입력해 주세요.");
		}
		String idempotencyKey;
		try {
			idempotencyKey = CardRequestIdentity.requireUuid(
				request.idempotencyKey(),
				"멱등성 키 형식이 올바르지 않습니다."
			);
		} catch (IllegalArgumentException error) {
			throw invalidRequest(error.getMessage());
		}
		String sourceText = requiredText(
			request.sourceText(),
			SOURCE_TEXT_MAX_LENGTH,
			"학습 원문은 1자 이상 20000자 이하여야 합니다."
		);
		String instruction = optionalText(
			request.instruction(),
			INSTRUCTION_MAX_LENGTH,
			"생성 지침은 1000자 이하여야 합니다."
		);
		int itemCount = request.itemCount() == null ? 0 : request.itemCount();
		if (itemCount < 1 || itemCount > ITEM_COUNT_MAX) {
			throw invalidRequest("카드 수는 1개 이상 30개 이하여야 합니다.");
		}
		return new NormalizedRequest(idempotencyKey, sourceText, instruction, itemCount);
	}

	private String requiredText(String value, int maxLength, String errorMessage) {
		if (value == null || value.trim().isEmpty()) throw invalidRequest(errorMessage);
		String normalized = value.trim();
		if (normalized.length() > maxLength) throw invalidRequest(errorMessage);
		return normalized;
	}

	private String optionalText(String value, int maxLength, String errorMessage) {
		if (value == null || value.trim().isEmpty()) return null;
		String normalized = value.trim();
		if (normalized.length() > maxLength) throw invalidRequest(errorMessage);
		return normalized;
	}

	private String requiredAiText(String value, int maxLength, String errorMessage) {
		if (value == null || value.trim().isEmpty()) throw invalidAiResponse(errorMessage);
		String normalized = value.trim();
		if (normalized.length() > maxLength) throw invalidAiResponse(errorMessage);
		return normalized;
	}

	private String optionalAiText(String value, int maxLength, String errorMessage) {
		if (value == null || value.trim().isEmpty()) return null;
		String normalized = value.trim();
		if (normalized.length() > maxLength) throw invalidAiResponse(errorMessage);
		return normalized;
	}

	private void markFailed(UUID usageId, UUID executionId, String errorCode) {
		try {
			usageService.markFailed(usageId, executionId, errorCode);
		} catch (RuntimeException error) {
			log.warn("AI 카드 덱 생성 실패 사용량을 기록하지 못했습니다. usageId={}", usageId, error);
		}
	}

	private CardDeckAiPreviewException invalidRequest(String message) {
		return new CardDeckAiPreviewException(400, "CARD_DECK_AI_REQUEST_INVALID", message);
	}

	private CardDeckAiPreviewException invalidAiResponse() {
		return invalidAiResponse("AI가 생성한 카드 덱 형식이 올바르지 않습니다.");
	}

	private CardDeckAiPreviewException invalidAiResponse(String message) {
		return new CardDeckAiPreviewException(
			502,
			"CARD_DECK_AI_RESPONSE_INVALID",
			message
		);
	}

	private record NormalizedRequest(
		String idempotencyKey,
		String sourceText,
		String instruction,
		int itemCount
	) {}
}
