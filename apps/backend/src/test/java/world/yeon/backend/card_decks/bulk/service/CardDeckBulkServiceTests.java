package world.yeon.backend.card_decks.bulk.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.card_decks.bulk.dto.CreateCardDeckBulkItemRequest;
import world.yeon.backend.card_decks.bulk.dto.CreateCardDeckBulkRequest;
import world.yeon.backend.card_decks.bulk.repository.CardDeckBulkRepository;
import world.yeon.backend.card_decks.bulk.dto.CreateCardDeckBulkResponse;
import world.yeon.backend.card_decks.route.dto.CardDeckDto;
import world.yeon.backend.card_decks.route.dto.CardDeckItemDto;
import world.yeon.backend.card_decks.support.CardRequestIdentity;
import world.yeon.backend.user_experience.domain.ExperienceActivity;
import world.yeon.backend.user_experience.service.ExperienceService;

@ExtendWith(MockitoExtension.class)
class CardDeckBulkServiceTests {
	private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000991");
	private static final UUID IDEMPOTENCY_KEY = UUID.fromString("00000000-0000-0000-0000-000000000992");
	private static final OffsetDateTime NOW = OffsetDateTime.parse("2026-07-11T00:00:00Z");

	@Mock private CardDeckBulkRepository repository;
	@Mock private ExperienceService experienceService;
	private CardDeckBulkService service;
	private final ObjectMapper objectMapper = new ObjectMapper();

	@BeforeEach
	void setUp() {
		service = new CardDeckBulkService(repository, objectMapper, experienceService);
	}

	@Test
	void 덱과카드를한트랜잭션에서생성한다() {
		var request = request(List.of(
			new CreateCardDeckBulkItemRequest("질문 1", "답 1", "images/one.png"),
			new CreateCardDeckBulkItemRequest("질문 2", "답 2", null)
		));
		var deck = deckRow();
		when(repository.insertDeck(anyString(), eq(USER_ID), eq("한국사"), eq("근현대사"), any()))
			.thenReturn(deck);
		when(repository.insertItem(anyString(), eq(11L), eq("질문 1"), eq("답 1"), eq("images/one.png"), any()))
			.thenReturn(itemRow(21L, "dki_1", "질문 1", "답 1", "images/one.png"));
		when(repository.insertItem(anyString(), eq(11L), eq("질문 2"), eq("답 2"), eq(null), any()))
			.thenReturn(itemRow(22L, "dki_2", "질문 2", "답 2", null));

		var response = service.create(USER_ID, request);

		assertThat(response.deck().id()).isEqualTo("dck_1");
		assertThat(response.deck().itemCount()).isEqualTo(2);
		assertThat(response.items()).extracting(item -> item.id()).containsExactly("dki_1", "dki_2");
		assertThat(response.items().getFirst().imageUrl()).isEqualTo("/api/v1/card-decks/assets/images/one.png");

		InOrder ordered = inOrder(repository);
		ordered.verify(repository).acquireCreationLock(USER_ID, IDEMPOTENCY_KEY);
		ordered.verify(repository).findCreationRequest(USER_ID, IDEMPOTENCY_KEY);
		ordered.verify(repository).insertDeck(anyString(), eq(USER_ID), eq("한국사"), eq("근현대사"), any());
		ordered.verify(repository).insertItem(anyString(), eq(11L), eq("질문 1"), eq("답 1"), eq("images/one.png"), any());
		ordered.verify(repository).insertItem(anyString(), eq(11L), eq("질문 2"), eq("답 2"), eq(null), any());
		verify(experienceService).award(USER_ID, ExperienceActivity.DECK_CREATED, "dck_1");
	}

	@Test
	void 동일한멱등성요청은불변생성스냅샷을반환한다() throws JsonProcessingException {
		var request = request(List.of(
			new CreateCardDeckBulkItemRequest("질문 1", "답 1", "images/one.png"),
			new CreateCardDeckBulkItemRequest("질문 2", "답 2", null)
		));
		when(repository.findCreationRequest(USER_ID, IDEMPOTENCY_KEY))
			.thenReturn(creationRequestRow(request, replayResponse()));

		var response = service.create(USER_ID, request);

		assertThat(response.deck().id()).isEqualTo("dck_1");
		assertThat(response.items()).hasSize(2);
		verify(repository, never()).insertDeck(any(), any(), any(), any(), any());
		verify(repository, never()).insertItem(anyString(), anyLong(), anyString(), anyString(), any(), any());
		verify(experienceService, never()).award(any(), any(), any());
	}

	@Test
	void 동일키의payload가다르면409이다() throws JsonProcessingException {
		var request = request(List.of(new CreateCardDeckBulkItemRequest("질문 1", "바뀐 답", "images/one.png")));
		var original = request(List.of(new CreateCardDeckBulkItemRequest("질문 1", "기존 답", "images/one.png")));
		when(repository.findCreationRequest(USER_ID, IDEMPOTENCY_KEY))
			.thenReturn(creationRequestRow(original, replayResponse()));

		assertThatThrownBy(() -> service.create(USER_ID, request))
			.isInstanceOfSatisfying(CardDeckBulkServiceException.class, error -> {
				assertThat(error.status()).isEqualTo(409);
				assertThat(error.code()).isEqualTo("CARD_DECK_BULK_IDEMPOTENCY_CONFLICT");
			})
			.hasMessage("같은 멱등성 키가 다른 덱 생성 요청에 사용되었습니다.");
		verify(repository, never()).insertDeck(any(), any(), any(), any(), any());
	}

	@Test
	void 생성메서드는단일트랜잭션경계다() throws Exception {
		var method = CardDeckBulkService.class.getMethod("create", UUID.class, CreateCardDeckBulkRequest.class);
		assertThat(method.getAnnotation(Transactional.class)).isNotNull();
	}

	@Test
	void 제목과설명의길이를검증한다() {
		assertInvalid(new CreateCardDeckBulkRequest(null, "덱", null, List.of(validItem())),
			"멱등성 키를 입력해주세요.");
		assertInvalid(new CreateCardDeckBulkRequest(IDEMPOTENCY_KEY, " ", null, List.of(validItem())),
			"덱 제목을 입력해주세요.");
		assertInvalid(new CreateCardDeckBulkRequest(
			IDEMPOTENCY_KEY,
			"가".repeat(121),
			null,
			List.of(validItem())
		), "덱 제목은 120자 이하여야 합니다.");
		assertInvalid(new CreateCardDeckBulkRequest(
			IDEMPOTENCY_KEY,
			"덱",
			"가".repeat(2_001),
			List.of(validItem())
		), "덱 설명은 2000자 이하여야 합니다.");
	}

	@Test
	void 계약과같이덱과카드필드의가장자리공백을정규화한다() {
		var request = new CreateCardDeckBulkRequest(
			IDEMPOTENCY_KEY,
			"  한국사  ",
			"  근현대사  ",
			List.of(new CreateCardDeckBulkItemRequest("  질문  ", "  답  ", "  images/one.png  "))
		);
		when(repository.insertDeck(anyString(), eq(USER_ID), eq("한국사"), eq("근현대사"), any()))
			.thenReturn(deckRow());
		when(repository.insertItem(anyString(), eq(11L), eq("질문"), eq("답"), eq("images/one.png"), any()))
			.thenReturn(itemRow(21L, "dki_1", "질문", "답", "images/one.png"));

		service.create(USER_ID, request);

		verify(repository).insertDeck(anyString(), eq(USER_ID), eq("한국사"), eq("근현대사"), any());
		verify(repository).insertItem(anyString(), eq(11L), eq("질문"), eq("답"), eq("images/one.png"), any());
	}

	@Test
	void 빈이미지저장키는null로정규화한다() {
		var request = request(List.of(new CreateCardDeckBulkItemRequest("질문", "답", "   ")));
		when(repository.insertDeck(anyString(), eq(USER_ID), eq("한국사"), eq("근현대사"), any()))
			.thenReturn(deckRow());
		when(repository.insertItem(anyString(), eq(11L), eq("질문"), eq("답"), eq(null), any()))
			.thenReturn(itemRow(21L, "dki_1", "질문", "답", null));

		service.create(USER_ID, request);

		verify(repository).insertItem(anyString(), eq(11L), eq("질문"), eq("답"), eq(null), any());
	}

	@Test
	void 정규화된동일payload는멱등재요청으로인식한다() throws JsonProcessingException {
		var request = new CreateCardDeckBulkRequest(
			IDEMPOTENCY_KEY,
			"  한국사  ",
			"  근현대사  ",
			List.of(new CreateCardDeckBulkItemRequest("  질문 1  ", "  답 1  ", "  images/one.png  "))
		);
		var normalized = request(List.of(
			new CreateCardDeckBulkItemRequest("질문 1", "답 1", "images/one.png")
		));
		when(repository.findCreationRequest(USER_ID, IDEMPOTENCY_KEY))
			.thenReturn(creationRequestRow(normalized, replayResponse()));

		var response = service.create(USER_ID, request);

		assertThat(response.items()).hasSize(2);
		verify(repository, never()).insertDeck(any(), any(), any(), any(), any());
	}

	private CardDeckBulkRepository.CreationRequestRow creationRequestRow(
		CreateCardDeckBulkRequest request,
		CreateCardDeckBulkResponse response
	) throws JsonProcessingException {
		List<String> values = new ArrayList<>();
		values.add(request.title().trim());
		values.add(request.description() == null ? null : request.description().trim());
		values.add(Integer.toString(request.items().size()));
		for (CreateCardDeckBulkItemRequest item : request.items()) {
			values.add(item.frontText().trim());
			values.add(item.backText().trim());
			String imageKey = item.imageStorageKey() == null ? null : item.imageStorageKey().trim();
			values.add(imageKey == null || imageKey.isEmpty() ? null : imageKey);
		}
		return new CardDeckBulkRepository.CreationRequestRow(
			USER_ID,
			IDEMPOTENCY_KEY,
			11L,
			CardRequestIdentity.fingerprint(values.toArray(String[]::new)),
			objectMapper.writeValueAsString(response),
			NOW
		);
	}

	private CreateCardDeckBulkResponse replayResponse() {
		String now = NOW.toInstant().toString();
		return new CreateCardDeckBulkResponse(
			new CardDeckDto("dck_1", "한국사", "근현대사", 2, now, now),
			List.of(
				new CardDeckItemDto("dki_1", "질문 1", "답 1", "images/one.png",
					"/api/v1/card-decks/assets/images/one.png", null, null, null, now, now),
				new CardDeckItemDto("dki_2", "질문 2", "답 2", null, null, null, null, null, now, now)
			)
		);
	}

	@Test
	void 카드개수범위를검증한다() {
		assertInvalid(new CreateCardDeckBulkRequest(IDEMPOTENCY_KEY, "덱", null, List.of()),
			"카드는 1개 이상 100개 이하로 입력해주세요.");
		List<CreateCardDeckBulkItemRequest> tooManyItems = new ArrayList<>();
		for (int index = 0; index < 101; index += 1) {
			tooManyItems.add(validItem());
		}
		assertInvalid(new CreateCardDeckBulkRequest(IDEMPOTENCY_KEY, "덱", null, tooManyItems),
			"카드는 1개 이상 100개 이하로 입력해주세요.");
	}

	@Test
	void 카드각필드의필수값과길이를검증한다() {
		assertInvalid(request(List.of(new CreateCardDeckBulkItemRequest(" ", "답", null))),
			"1번째 카드의 앞면을 입력해주세요.");
		assertInvalid(request(List.of(new CreateCardDeckBulkItemRequest("질문", " ", null))),
			"1번째 카드의 뒷면을 입력해주세요.");
		assertInvalid(request(List.of(new CreateCardDeckBulkItemRequest("가".repeat(20_001), "답", null))),
			"1번째 카드의 앞면은 20000자 이하여야 합니다.");
		assertInvalid(request(List.of(new CreateCardDeckBulkItemRequest("질문", "답", "a".repeat(513)))),
			"1번째 카드의 이미지 저장 키는 512자 이하여야 합니다.");
	}

	private void assertInvalid(CreateCardDeckBulkRequest request, String message) {
		assertThatThrownBy(() -> service.create(USER_ID, request))
			.isInstanceOf(CardDeckBulkServiceException.class)
			.hasMessage(message);
	}

	private CreateCardDeckBulkRequest request(List<CreateCardDeckBulkItemRequest> items) {
		return new CreateCardDeckBulkRequest(IDEMPOTENCY_KEY, "한국사", "근현대사", items);
	}

	private CreateCardDeckBulkItemRequest validItem() {
		return new CreateCardDeckBulkItemRequest("질문", "답", null);
	}

	private CardDeckBulkRepository.DeckRow deckRow() {
		return new CardDeckBulkRepository.DeckRow(
			11L,
			"dck_1",
			USER_ID,
			"한국사",
			"근현대사",
			NOW,
			NOW
		);
	}

	private CardDeckBulkRepository.ItemRow itemRow(
		long internalId,
		String publicId,
		String frontText,
		String backText,
		String imageStorageKey
	) {
		return new CardDeckBulkRepository.ItemRow(
			internalId,
			publicId,
			11L,
			frontText,
			backText,
			imageStorageKey,
			null,
			null,
			null,
			NOW,
			NOW
		);
	}
}
