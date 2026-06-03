package world.yeon.backend.typing_decks.service;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.typing_decks.domain.TypingDeckLanguageTag;
import world.yeon.backend.typing_decks.domain.TypingDeckVisibility;
import world.yeon.backend.typing_decks.domain.TypingPassageDifficulty;
import world.yeon.backend.typing_decks.domain.TypingPassageTextType;
import world.yeon.backend.typing_decks.service.TypingRaceSeedSigner.UnsignedTypingRaceSeed;
import world.yeon.backend.typing_decks.dto.CreateTypingDeckPassageRequest;
import world.yeon.backend.typing_decks.dto.CreateTypingDeckPassagesRequest;
import world.yeon.backend.typing_decks.dto.CreateTypingDeckPassagesResponse;
import world.yeon.backend.typing_decks.dto.CreateTypingDeckRequest;
import world.yeon.backend.typing_decks.dto.CreateTypingRaceSeedRequest;
import world.yeon.backend.typing_decks.dto.TypingDeckDetailResponse;
import world.yeon.backend.typing_decks.dto.TypingDeckDto;
import world.yeon.backend.typing_decks.dto.TypingDeckListResponse;
import world.yeon.backend.typing_decks.dto.TypingDeckPassageDto;
import world.yeon.backend.typing_decks.dto.TypingDeckPassageResponse;
import world.yeon.backend.typing_decks.dto.TypingDeckResponse;
import world.yeon.backend.typing_decks.dto.TypingRaceSeedDto;
import world.yeon.backend.typing_decks.dto.TypingRaceSeedResponse;
import world.yeon.backend.typing_decks.dto.UpdateTypingDeckPassageRequest;
import world.yeon.backend.typing_decks.dto.UpdateTypingDeckRequest;
import world.yeon.backend.typing_decks.repository.TypingDeckRepository;

@Service
public class TypingDeckService {
	private static final String SOURCE_USER = "user";
	private static final String SOURCE_DEFAULT = "default";
	private static final String LOBBY_PRIVATE_TITLE = "비공개 덱";
	private static final SecureRandom ID_RANDOM = new SecureRandom();
	private static final Base64.Encoder BASE64_URL = Base64.getUrlEncoder().withoutPadding();

	private final TypingDeckRepository repository;
	private final TypingRaceSeedSigner raceSeedSigner;

	@Autowired
	public TypingDeckService(TypingDeckRepository repository, TypingRaceSeedSigner raceSeedSigner) {
		this.repository = repository;
		this.raceSeedSigner = raceSeedSigner;
	}

	// 단위 테스트(TypingDeckServiceTests)가 협력자 없이 서비스를 직접 구성할 수 있도록 유지한다.
	// 서명 동작은 TypingRaceSeedSigner 기본 인스턴스가 그대로 수행한다(시크릿 해석/payload 불변).
	public TypingDeckService(TypingDeckRepository repository) {
		this(repository, new TypingRaceSeedSigner());
	}

	public TypingDeckListResponse listTypingDecks(UUID currentUserId, String scope, String languageTag, boolean adminMode) {
		String normalizedScope = normalizeScope(scope);
		if ("mine".equals(normalizedScope) && currentUserId == null) {
			throw new TypingDeckServiceException(401, "AUTH_REQUIRED", "로그인이 필요합니다.");
		}
		String normalizedLanguageTag = normalizeOptionalLanguageTag(languageTag);
		return new TypingDeckListResponse(repository.listDecks(currentUserId, normalizedScope, normalizedLanguageTag, adminMode)
			.stream()
			.map(row -> toDeckDto(row, currentUserId, adminMode))
			.toList());
	}

	@Transactional
	public TypingDeckResponse createTypingDeck(UUID currentUserId, CreateTypingDeckRequest request, boolean adminMode) {
		if (currentUserId == null) {
			throw new TypingDeckServiceException(401, "AUTH_REQUIRED", "로그인이 필요합니다.");
		}
		String title = normalizeTitle(request == null ? null : request.title());
		String description = normalizeDescription(request == null ? null : request.description());
		String languageTag = normalizeLanguageTag(request == null ? null : request.languageTag());
		String visibility = normalizeVisibility(request == null ? null : request.visibility());
		OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
		var row = repository.insertDeck(generateId("tdk_"), currentUserId, title, description, languageTag, visibility, SOURCE_USER, now);
		if (row == null) {
			throw new TypingDeckServiceException(500, "DECK_CREATE_FAILED", "타자 덱을 생성하지 못했습니다.");
		}
		return new TypingDeckResponse(toDeckDto(row, 0, currentUserId, adminMode));
	}

	public TypingDeckDetailResponse getTypingDeckDetail(UUID currentUserId, String deckPublicId, boolean adminMode) {
		var deck = findReadableDeck(currentUserId, deckPublicId, adminMode);
		var passages = repository.listPassagesByDeckId(deck.internalId()).stream().map(this::toPassageDto).toList();
		return new TypingDeckDetailResponse(toDeckDto(deck, passages.size(), currentUserId, adminMode), passages);
	}

	@Transactional
	public TypingDeckResponse updateTypingDeck(UUID currentUserId, String deckPublicId, UpdateTypingDeckRequest request, boolean adminMode) {
		var deck = findOwnedDeck(currentUserId, deckPublicId, adminMode);
		OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
		String title = request.hasTitle() ? normalizeTitle(request.title()) : deck.title();
		String description = request.hasDescription() ? normalizeDescription(request.description()) : deck.description();
		String languageTag = request.hasLanguageTag() ? normalizeLanguageTag(request.languageTag()) : deck.languageTag();
		String visibility = request.hasVisibility() ? normalizeVisibility(request.visibility()) : deck.visibility();
		var updated = repository.updateDeck(deck.internalId(), title, description, languageTag, visibility, now);
		if (updated == null) {
			throw new TypingDeckServiceException(500, "DECK_UPDATE_FAILED", "타자 덱을 수정하지 못했습니다.");
		}
		return new TypingDeckResponse(toDeckDto(updated, repository.countPassages(updated.internalId()), currentUserId, adminMode));
	}

	@Transactional
	public void deleteTypingDeck(UUID currentUserId, String deckPublicId, boolean adminMode) {
		var deck = findOwnedDeck(currentUserId, deckPublicId, adminMode);
		if (!repository.deleteDeck(deck.internalId())) {
			throw new TypingDeckServiceException(500, "DECK_DELETE_FAILED", "타자 덱을 삭제하지 못했습니다.");
		}
	}

	@Transactional
	public TypingDeckPassageResponse createTypingDeckPassage(UUID currentUserId, String deckPublicId, CreateTypingDeckPassageRequest request, boolean adminMode) {
		var deck = findOwnedDeck(currentUserId, deckPublicId, adminMode);
		int count = repository.countPassages(deck.internalId());
		OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
		var row = repository.insertPassage(
			generateId("tps_"),
			deck.internalId(),
			normalizePassageTitle(request == null ? null : request.title()),
			normalizePrompt(request == null ? null : request.prompt()),
			normalizeTextType(request == null ? null : request.textType()),
			normalizeDifficulty(request == null ? null : request.difficulty()),
			request != null && request.sortOrder() != null ? request.sortOrder() : count,
			now
		);
		if (row == null) {
			throw new TypingDeckServiceException(500, "PASSAGE_CREATE_FAILED", "연습 문장을 추가하지 못했습니다.");
		}
		repository.touchDeck(deck.internalId(), now);
		return new TypingDeckPassageResponse(toPassageDto(row));
	}

	@Transactional
	public CreateTypingDeckPassagesResponse createTypingDeckPassages(UUID currentUserId, String deckPublicId, CreateTypingDeckPassagesRequest request, boolean adminMode) {
		var deck = findOwnedDeck(currentUserId, deckPublicId, adminMode);
		List<CreateTypingDeckPassageRequest> passages = request == null || request.passages() == null ? List.of() : request.passages();
		if (passages.isEmpty()) {
			throw new IllegalArgumentException("연습 문장을 한 개 이상 보내주세요.");
		}
		int count = repository.countPassages(deck.internalId());
		OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
		var rows = new java.util.ArrayList<TypingDeckPassageDto>();
		for (int index = 0; index < passages.size(); index++) {
			var body = passages.get(index);
			var row = repository.insertPassage(
				generateId("tps_"),
				deck.internalId(),
				normalizePassageTitle(body.title()),
				normalizePrompt(body.prompt()),
				normalizeTextType(body.textType()),
				normalizeDifficulty(body.difficulty()),
				body.sortOrder() != null ? body.sortOrder() : count + index,
				now
			);
			rows.add(toPassageDto(row));
		}
		repository.touchDeck(deck.internalId(), now);
		return new CreateTypingDeckPassagesResponse(rows);
	}

	@Transactional
	public TypingDeckPassageResponse updateTypingDeckPassage(UUID currentUserId, String deckPublicId, String passagePublicId, UpdateTypingDeckPassageRequest request, boolean adminMode) {
		var owned = findOwnedPassage(currentUserId, deckPublicId, passagePublicId, adminMode);
		OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
		String title = request.hasTitle() ? normalizePassageTitle(request.title()) : owned.passage().title();
		String prompt = request.hasPrompt() ? normalizePrompt(request.prompt()) : owned.passage().prompt();
		String textType = request.hasTextType() ? normalizeTextType(request.textType()) : owned.passage().textType();
		String difficulty = request.hasDifficulty() ? normalizeDifficulty(request.difficulty()) : owned.passage().difficulty();
		int sortOrder = request.hasSortOrder() ? requireSortOrder(request.sortOrder()) : owned.passage().sortOrder();
		var updated = repository.updatePassage(owned.passage().internalId(), title, prompt, textType, difficulty, sortOrder, now);
		if (updated == null) {
			throw new TypingDeckServiceException(500, "PASSAGE_UPDATE_FAILED", "연습 문장을 수정하지 못했습니다.");
		}
		repository.touchDeck(owned.deck().internalId(), now);
		return new TypingDeckPassageResponse(toPassageDto(updated));
	}

	@Transactional
	public void deleteTypingDeckPassage(UUID currentUserId, String deckPublicId, String passagePublicId, boolean adminMode) {
		var owned = findOwnedPassage(currentUserId, deckPublicId, passagePublicId, adminMode);
		if (!repository.deletePassage(owned.passage().internalId())) {
			throw new TypingDeckServiceException(500, "PASSAGE_DELETE_FAILED", "연습 문장을 삭제하지 못했습니다.");
		}
		repository.touchDeck(owned.deck().internalId(), OffsetDateTime.now(ZoneOffset.UTC));
	}

	public TypingRaceSeedResponse createTypingRaceSeed(UUID currentUserId, String deckPublicId, CreateTypingRaceSeedRequest request) {
		TypingDeckDetailResponse detail = getTypingDeckDetail(currentUserId, deckPublicId, false);
		TypingDeckPassageDto passage = pickPassage(detail.passages(), request == null ? null : request.passageId());
		String roundLabel = passage.title() != null ? passage.title() : detail.deck().title();
		String lobbyDeckTitle = "private".equals(detail.deck().visibility()) ? LOBBY_PRIVATE_TITLE : detail.deck().title();
		var unsigned = new UnsignedTypingRaceSeed(
			passage.id(),
			passage.prompt(),
			roundLabel,
			detail.deck().id(),
			detail.deck().visibility(),
			lobbyDeckTitle,
			detail.deck().title(),
			detail.deck().languageTag()
		);
		return new TypingRaceSeedResponse(new TypingRaceSeedDto(
			unsigned.passageId(),
			unsigned.prompt(),
			unsigned.roundLabel(),
			raceSeedSigner.sign(unsigned),
			unsigned.deckId(),
			unsigned.deckVisibility(),
			unsigned.lobbyDeckTitle(),
			unsigned.participantDeckTitle(),
			unsigned.languageTag()
		));
	}

	private String normalizeScope(String scope) {
		String value = scope == null || scope.isBlank() ? "all" : scope.trim();
		if (!Set.of("default", "mine", "public", "all").contains(value)) {
			throw new IllegalArgumentException("덱 목록 범위가 올바르지 않습니다.");
		}
		return value;
	}

	private String normalizeOptionalLanguageTag(String value) {
		return TypingDeckLanguageTag.normalizeOptional(value);
	}

	private String normalizeLanguageTag(String value) {
		return TypingDeckLanguageTag.normalize(value);
	}

	private String normalizeVisibility(String value) {
		return TypingDeckVisibility.normalize(value);
	}

	private String normalizeTitle(String value) {
		if (value == null) {
			throw new IllegalArgumentException("덱 제목을 입력해주세요.");
		}
		String trimmed = value.trim();
		if (trimmed.isBlank()) {
			throw new IllegalArgumentException("덱 제목을 입력해주세요.");
		}
		return trimmed;
	}

	private String normalizeDescription(String value) {
		if (value == null) return null;
		String trimmed = value.trim();
		return trimmed.isBlank() ? null : trimmed;
	}

	private String normalizePassageTitle(String value) {
		if (value == null) return null;
		String trimmed = value.trim();
		return trimmed.isBlank() ? null : trimmed;
	}

	private String normalizePrompt(String value) {
		if (value == null) {
			throw new IllegalArgumentException("연습 문장을 입력해주세요.");
		}
		String trimmed = value.trim();
		if (trimmed.isBlank()) {
			throw new IllegalArgumentException("연습 문장을 입력해주세요.");
		}
		return trimmed;
	}

	private String normalizeTextType(String value) {
		return TypingPassageTextType.normalize(value);
	}

	private String normalizeDifficulty(String value) {
		return TypingPassageDifficulty.normalize(value);
	}

	private int requireSortOrder(Integer value) {
		if (value == null) {
			throw new IllegalArgumentException("정렬 순서가 올바르지 않습니다.");
		}
		return value;
	}

	private TypingDeckRepository.TypingDeckRow findReadableDeck(UUID currentUserId, String deckPublicId, boolean adminMode) {
		var row = repository.findDeckByPublicId(deckPublicId);
		if (row == null) {
			throw new TypingDeckServiceException(404, "DECK_NOT_FOUND", "타자 덱을 찾지 못했습니다.");
		}
		boolean isOwner = currentUserId != null && currentUserId.toString().equals(row.ownerUserId());
		if (adminMode || "public".equals(row.visibility()) || isOwner) {
			return row;
		}
		throw new TypingDeckServiceException(404, "DECK_NOT_FOUND", "타자 덱을 찾지 못했습니다.");
	}

	private TypingDeckRepository.TypingDeckRow findOwnedDeck(UUID currentUserId, String deckPublicId, boolean adminMode) {
		if (currentUserId == null) {
			throw new TypingDeckServiceException(401, "AUTH_REQUIRED", "로그인이 필요합니다.");
		}
		var row = repository.findDeckByPublicId(deckPublicId);
		if (row == null || (!adminMode && !currentUserId.toString().equals(row.ownerUserId()))) {
			throw new TypingDeckServiceException(404, "DECK_NOT_FOUND", "타자 덱을 찾지 못했습니다.");
		}
		if (!SOURCE_USER.equals(row.source())) {
			throw new TypingDeckServiceException(403, "DECK_EDIT_FORBIDDEN", "기본 덱은 수정할 수 없습니다.");
		}
		return row;
	}

	private OwnedPassage findOwnedPassage(UUID currentUserId, String deckPublicId, String passagePublicId, boolean adminMode) {
		var deck = findOwnedDeck(currentUserId, deckPublicId, adminMode);
		var passage = repository.findPassageByPublicIdAndDeckId(passagePublicId, deck.internalId());
		if (passage == null) {
			throw new TypingDeckServiceException(404, "PASSAGE_NOT_FOUND", "연습 문장을 찾지 못했습니다.");
		}
		return new OwnedPassage(deck, passage);
	}

	private TypingDeckDto toDeckDto(TypingDeckRepository.TypingDeckListRow row, UUID currentUserId, boolean adminMode) {
		return toDeckDto(new TypingDeckRepository.TypingDeckRow(row.internalId(), row.publicId(), row.ownerUserId(), row.title(), row.description(), row.languageTag(), row.visibility(), row.source(), row.createdAt(), row.updatedAt()), row.passageCount(), currentUserId, adminMode);
	}

	private TypingDeckDto toDeckDto(TypingDeckRepository.TypingDeckRow row, int passageCount, UUID currentUserId, boolean adminMode) {
		boolean isOwner = currentUserId != null && currentUserId.toString().equals(row.ownerUserId());
		boolean canManage = adminMode || isOwner;
		return new TypingDeckDto(
			row.publicId(),
			row.title(),
			row.description(),
			row.languageTag(),
			row.visibility(),
			row.source(),
			passageCount,
			isOwner,
			canManage && SOURCE_USER.equals(row.source()),
			toIso(row.createdAt()),
			toIso(row.updatedAt())
		);
	}

	private TypingDeckPassageDto toPassageDto(TypingDeckRepository.TypingDeckPassageRow row) {
		return new TypingDeckPassageDto(
			row.publicId(),
			row.title(),
			row.prompt(),
			row.textType(),
			row.difficulty(),
			row.sortOrder(),
			toIso(row.createdAt()),
			toIso(row.updatedAt())
		);
	}

	private String toIso(OffsetDateTime value) {
		return value == null ? null : value.toInstant().toString();
	}

	private TypingDeckPassageDto pickPassage(List<TypingDeckPassageDto> passages, String requestedPassageId) {
		if (requestedPassageId != null && !requestedPassageId.isBlank()) {
			return passages.stream().filter(passage -> requestedPassageId.equals(passage.id())).findFirst()
				.orElseThrow(() -> new TypingDeckServiceException(404, "PASSAGE_NOT_FOUND", "연습 문장을 찾지 못했습니다."));
		}
		if (passages.isEmpty()) {
			throw new TypingDeckServiceException(400, "EMPTY_DECK", "덱에 연습 문장이 없습니다.");
		}
		return passages.get(ThreadLocalRandom.current().nextInt(passages.size()));
	}

	private String generateId(String prefix) {
		byte[] bytes = new byte[9];
		ID_RANDOM.nextBytes(bytes);
		return prefix + BASE64_URL.encodeToString(bytes).substring(0, 12);
	}

	private record OwnedPassage(TypingDeckRepository.TypingDeckRow deck, TypingDeckRepository.TypingDeckPassageRow passage) {}
}
