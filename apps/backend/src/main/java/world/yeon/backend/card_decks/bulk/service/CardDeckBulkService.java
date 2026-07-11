package world.yeon.backend.card_decks.bulk.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.card_decks.bulk.dto.CreateCardDeckBulkItemRequest;
import world.yeon.backend.card_decks.bulk.dto.CreateCardDeckBulkRequest;
import world.yeon.backend.card_decks.bulk.dto.CreateCardDeckBulkResponse;
import world.yeon.backend.card_decks.bulk.repository.CardDeckBulkRepository;
import world.yeon.backend.card_decks.route.dto.CardDeckDto;
import world.yeon.backend.card_decks.route.dto.CardDeckItemDto;
import world.yeon.backend.card_decks.support.CardRequestIdentity;
import world.yeon.backend.user_experience.domain.ExperienceActivity;
import world.yeon.backend.user_experience.service.ExperienceService;

@Service
public class CardDeckBulkService {
	private static final Logger log = LoggerFactory.getLogger(CardDeckBulkService.class);
	private static final int MAX_TITLE_LENGTH = 120;
	private static final int MAX_DESCRIPTION_LENGTH = 2_000;
	private static final int MAX_ITEM_COUNT = 100;
	private static final int MAX_CARD_TEXT_LENGTH = 20_000;
	private static final int MAX_IMAGE_STORAGE_KEY_LENGTH = 512;
	private static final String ASSET_URL_PREFIX = "/api/v1/card-decks/assets/";
	private static final SecureRandom RANDOM = new SecureRandom();
	private static final Base64.Encoder BASE64_URL = Base64.getUrlEncoder().withoutPadding();

	private final CardDeckBulkRepository repository;
	private final ObjectMapper objectMapper;
	private final ExperienceService experienceService;

	public CardDeckBulkService(
		CardDeckBulkRepository repository,
		ObjectMapper objectMapper,
		ExperienceService experienceService
	) {
		this.repository = repository;
		this.objectMapper = objectMapper;
		this.experienceService = experienceService;
	}

	@Transactional
	public CreateCardDeckBulkResponse create(UUID userId, CreateCardDeckBulkRequest request) {
		ValidatedPayload payload = validate(request);
		String requestFingerprint = fingerprint(payload);
		repository.acquireCreationLock(userId, payload.idempotencyKey());

		var existingRequest = repository.findCreationRequest(userId, payload.idempotencyKey());
		if (existingRequest != null) {
			if (!existingRequest.requestFingerprint().equals(requestFingerprint)) {
				throw new CardDeckBulkServiceException(
					409,
					"CARD_DECK_BULK_IDEMPOTENCY_CONFLICT",
					"같은 멱등성 키가 다른 덱 생성 요청에 사용되었습니다."
				);
			}
			return readReplay(existingRequest.responsePayload());
		}

		OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
		var createdDeck = repository.insertDeck(
			generatePublicId("dck"),
			userId,
			payload.title(),
			payload.description(),
			now
		);
		if (createdDeck == null) {
			throw new CardDeckBulkServiceException(500, "CARD_DECK_BULK_CREATE_FAILED", "덱을 생성하지 못했습니다.");
		}

		List<CardDeckBulkRepository.ItemRow> createdItems = new ArrayList<>(payload.items().size());
		for (NormalizedItem item : payload.items()) {
			var createdItem = repository.insertItem(
				generatePublicId("dki"),
				createdDeck.internalId(),
				item.frontText(),
				item.backText(),
				item.imageStorageKey(),
				now
			);
			if (createdItem == null) {
				throw new CardDeckBulkServiceException(500, "CARD_DECK_BULK_ITEM_CREATE_FAILED", "카드를 생성하지 못했습니다.");
			}
			createdItems.add(createdItem);
		}
		CreateCardDeckBulkResponse response = toResponse(createdDeck, createdItems);
		repository.insertCreationRequest(
			userId,
			payload.idempotencyKey(),
			createdDeck.internalId(),
			requestFingerprint,
			writeReplay(response),
			now
		);
		awardDeckCreated(userId, createdDeck.publicId());
		return response;
	}

	private ValidatedPayload validate(CreateCardDeckBulkRequest request) {
		if (request == null) {
			throw invalid("덱 생성 요청을 입력해주세요.");
		}
		if (request.idempotencyKey() == null) {
			throw invalid("멱등성 키를 입력해주세요.");
		}
		String title = request.title();
		if (title == null || title.trim().isBlank()) {
			throw invalid("덱 제목을 입력해주세요.");
		}
		title = title.trim();
		if (title.length() > MAX_TITLE_LENGTH) {
			throw invalid("덱 제목은 120자 이하여야 합니다.");
		}
		String description = request.description() == null ? null : request.description().trim();
		if (description != null && description.isEmpty()) {
			description = null;
		}
		if (description != null && description.length() > MAX_DESCRIPTION_LENGTH) {
			throw invalid("덱 설명은 2000자 이하여야 합니다.");
		}
		List<CreateCardDeckBulkItemRequest> items = request.items();
		if (items == null || items.isEmpty() || items.size() > MAX_ITEM_COUNT) {
			throw invalid("카드는 1개 이상 100개 이하로 입력해주세요.");
		}
		List<NormalizedItem> normalizedItems = new ArrayList<>(items.size());
		for (int index = 0; index < items.size(); index += 1) {
			normalizedItems.add(normalizeItem(items.get(index), index));
		}
		return new ValidatedPayload(request.idempotencyKey(), title, description, List.copyOf(normalizedItems));
	}

	private NormalizedItem normalizeItem(CreateCardDeckBulkItemRequest item, int index) {
		int position = index + 1;
		if (item == null) {
			throw invalid(position + "번째 카드 정보가 비어 있습니다.");
		}
		String frontText = normalizeCardText(item.frontText(), position, "앞면");
		String backText = normalizeCardText(item.backText(), position, "뒷면");
		String imageStorageKey = item.imageStorageKey() == null ? null : item.imageStorageKey().trim();
		if (imageStorageKey != null && imageStorageKey.isEmpty()) {
			imageStorageKey = null;
		}
		if (imageStorageKey != null && imageStorageKey.length() > MAX_IMAGE_STORAGE_KEY_LENGTH) {
			throw invalid(position + "번째 카드의 이미지 저장 키는 512자 이하여야 합니다.");
		}
		return new NormalizedItem(frontText, backText, imageStorageKey);
	}

	private String normalizeCardText(String value, int position, String side) {
		if (value == null || value.trim().isBlank()) {
			throw invalid(position + "번째 카드의 " + side + "을 입력해주세요.");
		}
		String normalized = value.trim();
		if (normalized.length() > MAX_CARD_TEXT_LENGTH) {
			throw invalid(position + "번째 카드의 " + side + "은 20000자 이하여야 합니다.");
		}
		return normalized;
	}

	private String fingerprint(ValidatedPayload payload) {
		List<String> values = new ArrayList<>(3 + payload.items().size() * 3);
		values.add(payload.title());
		values.add(payload.description());
		values.add(Integer.toString(payload.items().size()));
		for (NormalizedItem item : payload.items()) {
			values.add(item.frontText());
			values.add(item.backText());
			values.add(item.imageStorageKey());
		}
		return CardRequestIdentity.fingerprint(values.toArray(String[]::new));
	}

	private String writeReplay(CreateCardDeckBulkResponse response) {
		try {
			return objectMapper.writeValueAsString(response);
		} catch (JsonProcessingException error) {
			throw replayFailure("CARD_DECK_BULK_REPLAY_SERIALIZATION_FAILED", "덱 생성 결과를 저장하지 못했습니다.", error);
		}
	}

	private CreateCardDeckBulkResponse readReplay(String payload) {
		try {
			return objectMapper.readValue(payload, CreateCardDeckBulkResponse.class);
		} catch (JsonProcessingException error) {
			throw replayFailure("CARD_DECK_BULK_REPLAY_INVALID", "저장된 덱 생성 결과를 불러오지 못했습니다.", error);
		}
	}

	private CardDeckBulkServiceException replayFailure(String code, String message, JsonProcessingException error) {
		return new CardDeckBulkServiceException(500, code, message, error);
	}

	private void awardDeckCreated(UUID userId, String deckPublicId) {
		try {
			experienceService.award(userId, ExperienceActivity.DECK_CREATED, deckPublicId);
		} catch (RuntimeException error) {
			log.warn("bulk 덱 생성 경험치 적립에 실패했습니다(덱 생성은 정상). userId={}, deckId={}", userId, deckPublicId, error);
		}
	}

	private CreateCardDeckBulkResponse toResponse(
		CardDeckBulkRepository.DeckRow deck,
		List<CardDeckBulkRepository.ItemRow> items
	) {
		CardDeckDto deckDto = new CardDeckDto(
			deck.publicId(),
			deck.title(),
			deck.description(),
			items.size(),
			toIso(deck.createdAt()),
			toIso(deck.updatedAt())
		);
		List<CardDeckItemDto> itemDtos = items.stream().map(this::toItemDto).toList();
		return new CreateCardDeckBulkResponse(deckDto, itemDtos);
	}

	private CardDeckItemDto toItemDto(CardDeckBulkRepository.ItemRow item) {
		String imageStorageKey = item.imageStorageKey();
		String imageUrl = imageStorageKey == null || imageStorageKey.isBlank()
			? null
			: ASSET_URL_PREFIX + imageStorageKey;
		return new CardDeckItemDto(
			item.publicId(),
			item.frontText(),
			item.backText(),
			imageStorageKey,
			imageUrl,
			item.reviewDifficulty(),
			toIso(item.lastReviewedAt()),
			toIso(item.nextReviewAt()),
			toIso(item.createdAt()),
			toIso(item.updatedAt())
		);
	}

	private CardDeckBulkServiceException invalid(String message) {
		return new CardDeckBulkServiceException(400, "CARD_DECK_BULK_REQUEST_INVALID", message);
	}

	private String toIso(OffsetDateTime value) {
		return value == null ? null : value.toInstant().toString();
	}

	private String generatePublicId(String prefix) {
		byte[] bytes = new byte[9];
		RANDOM.nextBytes(bytes);
		return prefix + "_" + BASE64_URL.encodeToString(bytes).substring(0, 12);
	}

	private record ValidatedPayload(
		UUID idempotencyKey,
		String title,
		String description,
		List<NormalizedItem> items
	) {}

	private record NormalizedItem(String frontText, String backText, String imageStorageKey) {}
}
