package world.yeon.backend.card_decks.route.service;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.card_decks.route.dto.*;
import world.yeon.backend.card_decks.route.repository.CardDeckRouteRepository;
import world.yeon.backend.user_experience.domain.ExperienceActivity;
import world.yeon.backend.user_experience.service.ExperienceService;

@Service
public class CardDeckRouteService {
	private static final Logger log = LoggerFactory.getLogger(CardDeckRouteService.class);
	private static final SecureRandom RANDOM = new SecureRandom();
	private static final Base64.Encoder BASE64_URL = Base64.getUrlEncoder().withoutPadding();
	private static final Set<String> STUDY_MODES = Set.of("flashcard", "review");
	private static final Set<String> REVIEW_DIFFICULTIES = Set.of("hard", "good", "easy");
	private static final String ASSET_URL_PREFIX = "/api/v1/card-decks/assets/";

	private final CardDeckRouteRepository repository;
	private final ExperienceService experienceService;

	public CardDeckRouteService(CardDeckRouteRepository repository, ExperienceService experienceService) {
		this.repository = repository;
		this.experienceService = experienceService;
	}

	public CardDeckListResponse listDecks(UUID userId) {
		return new CardDeckListResponse(repository.listDecks(userId).stream().map(this::toDeckDto).toList());
	}

	@Transactional
	public CardDeckResponse createDeck(UUID userId, CreateCardDeckRequest request) {
		String title = normalizeDeckTitle(request == null ? null : request.title());
		String description = normalizeDescription(request == null ? null : request.description());
		OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
		var row = repository.insertDeck(generatePublicId("dck"), userId, title, description, now);
		if (row == null) throw new CardDeckRouteServiceException(500, "DECK_CREATE_FAILED", "덱을 생성하지 못했습니다.");
		awardDeckCreated(userId, row.publicId());
		return new CardDeckResponse(toDeckDto(row, 0));
	}

	public CardDeckDetailResponse getDeckDetail(UUID userId, String deckPublicId) {
		var deck = findOwnedDeck(userId, deckPublicId);
		var items = repository.listDeckItems(deck.internalId()).stream().map(this::toItemDto).toList();
		String studyMode = toStudyMode(repository.findUserCardStudyMode(userId));
		return new CardDeckDetailResponse(toDeckDto(deck, items.size()), items, studyMode);
	}

	@Transactional
	public CardDeckResponse updateDeck(UUID userId, String deckPublicId, UpdateCardDeckRequest request) {
		var deck = findOwnedDeck(userId, deckPublicId);
		OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
		String title = request.hasTitle() ? normalizeDeckTitle(request.title()) : deck.title();
		String description = request.hasDescription() ? normalizeDescription(request.description()) : deck.description();
		var updated = repository.updateDeck(deck.internalId(), title, description, now);
		if (updated == null) throw new CardDeckRouteServiceException(500, "DECK_UPDATE_FAILED", "덱을 수정하지 못했습니다.");
		return new CardDeckResponse(toDeckDto(updated, repository.countItems(updated.internalId())));
	}

	@Transactional
	public void deleteDeck(UUID userId, String deckPublicId) {
		var deck = findOwnedDeck(userId, deckPublicId);
		if (!repository.deleteDeck(deck.internalId())) {
			throw new CardDeckRouteServiceException(500, "DECK_DELETE_FAILED", "덱을 삭제하지 못했습니다.");
		}
	}

	@Transactional
	public CardDeckItemResponse createItem(UUID userId, String deckPublicId, CreateCardDeckItemRequest request) {
		var deck = findOwnedDeck(userId, deckPublicId);
		String frontText = normalizeCardText(request == null ? null : request.frontText(), "앞면과 뒷면을 모두 입력해주세요.");
		String backText = normalizeCardText(request == null ? null : request.backText(), "앞면과 뒷면을 모두 입력해주세요.");
		String imageStorageKey = normalizeImageStorageKey(request == null ? null : request.imageStorageKey());
		OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
		var row = repository.insertItem(generatePublicId("dki"), deck.internalId(), frontText, backText, imageStorageKey, now);
		repository.touchDeck(deck.internalId(), now);
		if (row == null) throw new CardDeckRouteServiceException(500, "ITEM_CREATE_FAILED", "카드를 추가하지 못했습니다.");
		return new CardDeckItemResponse(toItemDto(row));
	}

	@Transactional
	public CreateCardDeckItemsResponse createItems(UUID userId, String deckPublicId, CreateCardDeckItemsRequest request) {
		var deck = findOwnedDeck(userId, deckPublicId);
		List<CreateCardDeckItemRequest> items = request == null || request.items() == null ? List.of() : request.items();
		if (items.isEmpty()) throw new IllegalArgumentException("요청 데이터가 올바르지 않습니다.");
		OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
		var created = new java.util.ArrayList<CardDeckItemDto>();
		for (CreateCardDeckItemRequest item : items) {
			String frontText = normalizeCardText(item.frontText(), "앞면과 뒷면을 모두 입력해주세요.");
			String backText = normalizeCardText(item.backText(), "앞면과 뒷면을 모두 입력해주세요.");
			String imageStorageKey = normalizeImageStorageKey(item.imageStorageKey());
			created.add(toItemDto(repository.insertItem(generatePublicId("dki"), deck.internalId(), frontText, backText, imageStorageKey, now)));
		}
		repository.touchDeck(deck.internalId(), now);
		return new CreateCardDeckItemsResponse(created);
	}

	@Transactional
	public CardDeckItemResponse updateItem(UUID userId, String deckPublicId, String itemPublicId, UpdateCardDeckItemRequest request) {
		var owned = findOwnedItem(userId, deckPublicId, itemPublicId);
		String frontText = request.hasFrontText() ? normalizeSingleSide(request.frontText(), "앞면을 입력해주세요.") : owned.frontText();
		String backText = request.hasBackText() ? normalizeSingleSide(request.backText(), "뒷면을 입력해주세요.") : owned.backText();
		boolean updateImageStorageKey = request.hasImageStorageKey();
		String imageStorageKey = updateImageStorageKey ? normalizeImageStorageKey(request.imageStorageKey()) : null;
		OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
		var updated = repository.updateItem(owned.internalId(), frontText, backText, updateImageStorageKey, imageStorageKey, now);
		repository.touchDeck(owned.deckId(), now);
		if (updated == null) throw new CardDeckRouteServiceException(500, "ITEM_UPDATE_FAILED", "카드를 수정하지 못했습니다.");
		return new CardDeckItemResponse(toItemDto(updated));
	}

	@Transactional
	public void deleteItem(UUID userId, String deckPublicId, String itemPublicId) {
		var owned = findOwnedItem(userId, deckPublicId, itemPublicId);
		if (!repository.deleteItem(owned.internalId())) {
			throw new CardDeckRouteServiceException(500, "ITEM_DELETE_FAILED", "카드를 삭제하지 못했습니다.");
		}
		repository.touchDeck(owned.deckId(), OffsetDateTime.now(ZoneOffset.UTC));
	}

	public CardStudyPreferenceResponse getStudyPreference(UUID userId) {
		return new CardStudyPreferenceResponse(toStudyMode(repository.findUserCardStudyMode(userId)));
	}

	@Transactional
	public CardStudyPreferenceResponse updateStudyPreference(UUID userId, UpdateCardStudyPreferenceRequest request) {
		String studyMode = normalizeStudyMode(request == null ? null : request.studyMode());
		String updated = repository.updateUserCardStudyMode(userId, studyMode, OffsetDateTime.now(ZoneOffset.UTC));
		if (updated == null) throw new CardDeckRouteServiceException(404, "USER_NOT_FOUND", "사용자를 찾지 못했습니다.");
		return new CardStudyPreferenceResponse(toStudyMode(updated));
	}

	@Transactional
	public CardDeckItemResponse reviewItem(UUID userId, String deckPublicId, String itemPublicId, ReviewCardDeckItemRequest request) {
		var owned = findOwnedItem(userId, deckPublicId, itemPublicId);
		String difficulty = normalizeDifficulty(request == null ? null : request.difficulty());
		OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
		OffsetDateTime nextReviewAt = switch (difficulty) {
			case "hard" -> now.plusDays(1);
			case "good" -> now.plusDays(3);
			default -> now.plusDays(4);
		};
		var updated = repository.reviewItem(owned.internalId(), difficulty, now, nextReviewAt);
		if (updated == null) throw new CardDeckRouteServiceException(500, "ITEM_REVIEW_FAILED", "복습 결과를 저장하지 못했습니다.");
		return new CardDeckItemResponse(toItemDto(updated));
	}

	// 경험치 적립은 덱 생성 성공의 부수효과이므로, 실패가 덱 생성 트랜잭션을 깨지 않도록
	// 별도 트랜잭션(REQUIRES_NEW) + try/catch로 방어한다. 실패해도 덱 생성은 그대로 성공한다.
	private void awardDeckCreated(UUID userId, String deckPublicId) {
		try {
			experienceService.award(userId, ExperienceActivity.DECK_CREATED, deckPublicId);
		} catch (RuntimeException error) {
			log.warn("덱 생성 경험치 적립에 실패했습니다(덱 생성은 정상). userId={}, deckId={}", userId, deckPublicId, error);
		}
	}

	private CardDeckRouteRepository.CardDeckRow findOwnedDeck(UUID userId, String deckPublicId) {
		var row = repository.findOwnedDeck(userId, deckPublicId);
		if (row == null) throw new CardDeckRouteServiceException(404, "DECK_NOT_FOUND", "덱을 찾지 못했습니다.");
		return row;
	}

	private CardDeckRouteRepository.CardDeckItemRow findOwnedItem(UUID userId, String deckPublicId, String itemPublicId) {
		var row = repository.findOwnedItem(userId, deckPublicId, itemPublicId);
		if (row == null) throw new CardDeckRouteServiceException(404, "ITEM_NOT_FOUND", "카드를 찾지 못했습니다.");
		return row;
	}

	private CardDeckDto toDeckDto(CardDeckRouteRepository.CardDeckListRow row) {
		return new CardDeckDto(row.publicId(), row.title(), row.description(), row.itemCount(), toIso(row.createdAt()), toIso(row.updatedAt()));
	}
	private CardDeckDto toDeckDto(CardDeckRouteRepository.CardDeckRow row, int itemCount) {
		return new CardDeckDto(row.publicId(), row.title(), row.description(), itemCount, toIso(row.createdAt()), toIso(row.updatedAt()));
	}
	private CardDeckItemDto toItemDto(CardDeckRouteRepository.CardDeckItemRow row) {
		String imageStorageKey = row.imageStorageKey();
		String imageUrl = toImageUrl(imageStorageKey);
		return new CardDeckItemDto(row.publicId(), row.frontText(), row.backText(), imageStorageKey, imageUrl, row.reviewDifficulty(), toIso(row.lastReviewedAt()), toIso(row.nextReviewAt()), toIso(row.createdAt()), toIso(row.updatedAt()));
	}
	private String toIso(OffsetDateTime value) { return value == null ? null : value.toInstant().toString(); }
	private String normalizeDeckTitle(String value) {
		if (value == null || value.trim().isBlank()) throw new IllegalArgumentException("덱 제목을 입력해주세요.");
		return value.trim();
	}
	private String normalizeDescription(String value) { return value == null || value.trim().isBlank() ? null : value.trim(); }
	private String normalizeCardText(String value, String message) {
		if (value == null || value.trim().isBlank()) throw new CardDeckRouteServiceException(400, "EMPTY_CARD_TEXT", message);
		return value.trim();
	}
	private String normalizeSingleSide(String value, String message) {
		if (value == null || value.trim().isBlank()) throw new CardDeckRouteServiceException(400, "EMPTY_CARD_TEXT", message);
		return value.trim();
	}
	private String normalizeImageStorageKey(String value) { return value == null || value.trim().isBlank() ? null : value.trim(); }
	private String toImageUrl(String storageKey) { return storageKey == null || storageKey.isBlank() ? null : ASSET_URL_PREFIX + storageKey; }
	private String toStudyMode(String value) { return "review".equals(value) ? "review" : "flashcard"; }
	private String normalizeStudyMode(String value) {
		if (value == null || !STUDY_MODES.contains(value)) throw new IllegalArgumentException("학습 모드 설정값이 올바르지 않습니다.");
		return value;
	}
	private String normalizeDifficulty(String value) {
		if (value == null || !REVIEW_DIFFICULTIES.contains(value)) throw new IllegalArgumentException("복습 결과 형식이 올바르지 않습니다.");
		return value;
	}
	private String generatePublicId(String prefix) {
		byte[] bytes = new byte[9];
		RANDOM.nextBytes(bytes);
		return prefix + "_" + BASE64_URL.encodeToString(bytes).substring(0, 12);
	}
}
