package world.yeon.backend.card_decks.route.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import world.yeon.backend.card_decks.route.dto.*;
import world.yeon.backend.card_decks.route.repository.CardDeckRouteRepository;

@ExtendWith(MockitoExtension.class)
class CardDeckRouteServiceTests {
	private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000983");
	@Mock private CardDeckRouteRepository repository;
	private CardDeckRouteService service;

	@BeforeEach void setUp() { service = new CardDeckRouteService(repository); }

	@Test void 목록응답을반환한다() {
		when(repository.listDecks(USER_ID)).thenReturn(List.of(new CardDeckRouteRepository.CardDeckListRow(1L, "dck_1", USER_ID.toString(), "덱", null, OffsetDateTime.parse("2026-05-08T00:00:00Z"), OffsetDateTime.parse("2026-05-08T00:00:00Z"), 2)));
		assertThat(service.listDecks(USER_ID).decks()).hasSize(1);
	}

	@Test void 덱을생성한다() {
		when(repository.insertDeck(any(), eq(USER_ID), eq("덱"), eq(null), any())).thenReturn(new CardDeckRouteRepository.CardDeckRow(1L, "dck_1", USER_ID.toString(), "덱", null, OffsetDateTime.parse("2026-05-08T00:00:00Z"), OffsetDateTime.parse("2026-05-08T00:00:00Z")));
		assertThat(service.createDeck(USER_ID, new CreateCardDeckRequest("덱", null)).deck().id()).isEqualTo("dck_1");
	}

	@Test void 덱이없으면404다() {
		when(repository.findOwnedDeck(USER_ID, "missing")).thenReturn(null);
		assertThatThrownBy(() -> service.getDeckDetail(USER_ID, "missing")).isInstanceOf(CardDeckRouteServiceException.class).hasMessage("덱을 찾지 못했습니다.");
	}

	@Test void 복습결과를저장한다() {
		when(repository.findOwnedItem(USER_ID, "dck_1", "dki_1")).thenReturn(new CardDeckRouteRepository.CardDeckItemRow(2L, "dki_1", 1L, "앞", "뒤", null, null, null, null, OffsetDateTime.parse("2026-05-08T00:00:00Z"), OffsetDateTime.parse("2026-05-08T00:00:00Z")));
		when(repository.reviewItem(eq(2L), eq("good"), any(), any())).thenReturn(new CardDeckRouteRepository.CardDeckItemRow(2L, "dki_1", 1L, "앞", "뒤", null, "good", OffsetDateTime.parse("2026-05-08T00:00:00Z"), OffsetDateTime.parse("2026-05-11T00:00:00Z"), OffsetDateTime.parse("2026-05-08T00:00:00Z"), OffsetDateTime.parse("2026-05-08T00:00:00Z")));
		assertThat(service.reviewItem(USER_ID, "dck_1", "dki_1", new ReviewCardDeckItemRequest("good")).item().reviewDifficulty()).isEqualTo("good");
	}
}
