package world.yeon.backend.card_decks.route.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import world.yeon.backend.card_decks.route.dto.*;
import world.yeon.backend.card_decks.route.service.CardDeckRouteService;
import world.yeon.backend.card_decks.route.service.CardDeckRouteServiceException;

@WebMvcTest(CardDeckRouteController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class CardDeckRouteControllerTests {
	private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000984");
	@Autowired private MockMvc mockMvc;
	@MockitoBean private CardDeckRouteService service;

	@Test void 목록과설정응답shape를반환한다() throws Exception {
		when(service.listDecks(eq(USER_ID))).thenReturn(new CardDeckListResponse(List.of(new CardDeckDto("dck_1", "덱", null, 1, "2026-05-08T00:00:00Z", "2026-05-08T00:00:00Z"))));
		when(service.getStudyPreference(eq(USER_ID))).thenReturn(new CardStudyPreferenceResponse("flashcard"));
		mockMvc.perform(get("/card-decks").header("X-Yeon-User-Id", USER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.decks[0].id").value("dck_1"));
		mockMvc.perform(get("/card-decks/study-preference").header("X-Yeon-User-Id", USER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.studyMode").value("flashcard"));
	}

	@Test void create와review응답shape를반환한다() throws Exception {
		when(service.createDeck(eq(USER_ID), eq(new CreateCardDeckRequest("덱", null)))).thenReturn(new CardDeckResponse(new CardDeckDto("dck_1", "덱", null, 0, "2026-05-08T00:00:00Z", "2026-05-08T00:00:00Z")));
		when(service.reviewItem(eq(USER_ID), eq("dck_1"), eq("dki_1"), eq(new ReviewCardDeckItemRequest("good")))).thenReturn(new CardDeckItemResponse(new CardDeckItemDto("dki_1", "앞", "뒤", null, null, "good", "2026-05-08T00:00:00Z", "2026-05-11T00:00:00Z", "2026-05-08T00:00:00Z", "2026-05-08T00:00:00Z")));
		mockMvc.perform(post("/card-decks").header("X-Yeon-User-Id", USER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token").contentType(MediaType.APPLICATION_JSON).content("{\"title\":\"덱\",\"description\":null}"))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.deck.id").value("dck_1"));
		mockMvc.perform(post("/card-decks/dck_1/items/dki_1/review").header("X-Yeon-User-Id", USER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token").contentType(MediaType.APPLICATION_JSON).content("{\"difficulty\":\"good\"}"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.item.reviewDifficulty").value("good"));
	}

	@Test void patch본문을카드덱수정요청으로변환한다() throws Exception {
		when(service.updateDeck(eq(USER_ID), eq("dck_1"), any(UpdateCardDeckRequest.class))).thenReturn(new CardDeckResponse(new CardDeckDto("dck_1", "새 덱", null, 0, "2026-05-08T00:00:00Z", "2026-05-18T00:00:00Z")));

		mockMvc.perform(patch("/card-decks/dck_1").header("X-Yeon-User-Id", USER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token").contentType(MediaType.APPLICATION_JSON).content("{\"title\":\"새 덱\"}"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.deck.title").value("새 덱"));

		ArgumentCaptor<UpdateCardDeckRequest> request = ArgumentCaptor.forClass(UpdateCardDeckRequest.class);
		verify(service).updateDeck(eq(USER_ID), eq("dck_1"), request.capture());
		org.assertj.core.api.Assertions.assertThat(request.getValue().hasTitle()).isTrue();
		org.assertj.core.api.Assertions.assertThat(request.getValue().title()).isEqualTo("새 덱");
		org.assertj.core.api.Assertions.assertThat(request.getValue().hasDescription()).isFalse();
	}

	@Test void patch본문을카드아이템수정요청으로변환한다() throws Exception {
		when(service.updateItem(eq(USER_ID), eq("dck_1"), eq("dki_1"), any(UpdateCardDeckItemRequest.class))).thenReturn(new CardDeckItemResponse(new CardDeckItemDto("dki_1", "새 앞", "뒤", null, null, null, null, null, "2026-05-08T00:00:00Z", "2026-05-18T00:00:00Z")));

		mockMvc.perform(patch("/card-decks/dck_1/items/dki_1").header("X-Yeon-User-Id", USER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token").contentType(MediaType.APPLICATION_JSON).content("{\"frontText\":\"새 앞\"}"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.item.frontText").value("새 앞"));

		ArgumentCaptor<UpdateCardDeckItemRequest> request = ArgumentCaptor.forClass(UpdateCardDeckItemRequest.class);
		verify(service).updateItem(eq(USER_ID), eq("dck_1"), eq("dki_1"), request.capture());
		org.assertj.core.api.Assertions.assertThat(request.getValue().hasFrontText()).isTrue();
		org.assertj.core.api.Assertions.assertThat(request.getValue().frontText()).isEqualTo("새 앞");
		org.assertj.core.api.Assertions.assertThat(request.getValue().hasBackText()).isFalse();
	}

	@Test void service오류는상태코드를보존한다() throws Exception {
		when(service.getDeckDetail(eq(USER_ID), eq("missing"))).thenThrow(new CardDeckRouteServiceException(404, "DECK_NOT_FOUND", "덱을 찾지 못했습니다."));
		mockMvc.perform(get("/card-decks/missing").header("X-Yeon-User-Id", USER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isNotFound())
			.andExpect(jsonPath("$.message").value("덱을 찾지 못했습니다."));
	}
}
