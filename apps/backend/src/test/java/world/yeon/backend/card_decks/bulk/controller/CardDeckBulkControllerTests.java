package world.yeon.backend.card_decks.bulk.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import world.yeon.backend.card_decks.bulk.dto.CreateCardDeckBulkRequest;
import world.yeon.backend.card_decks.bulk.dto.CreateCardDeckBulkResponse;
import world.yeon.backend.card_decks.bulk.service.CardDeckBulkService;
import world.yeon.backend.card_decks.bulk.service.CardDeckBulkServiceException;
import world.yeon.backend.card_decks.route.dto.CardDeckDto;
import world.yeon.backend.card_decks.route.dto.CardDeckItemDto;

@WebMvcTest(CardDeckBulkController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class CardDeckBulkControllerTests {
	private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000991");
	private static final UUID IDEMPOTENCY_KEY = UUID.fromString("00000000-0000-0000-0000-000000000992");
	@Autowired private MockMvc mockMvc;
	@MockitoBean private CardDeckBulkService service;

	@Test
	void 덱과카드생성결과를201로반환한다() throws Exception {
		when(service.create(eq(USER_ID), any(CreateCardDeckBulkRequest.class))).thenReturn(response());

		mockMvc.perform(post("/card-decks/bulk")
			.header("X-Yeon-User-Id", USER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
				{
				  "idempotencyKey": "00000000-0000-0000-0000-000000000992",
				  "title": "한국사",
				  "description": "근현대사",
				  "items": [
				    {"frontText": "질문", "backText": "답", "imageStorageKey": null}
				  ]
				}
				"""))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.deck.id").value("dck_1"))
			.andExpect(jsonPath("$.deck.itemCount").value(1))
			.andExpect(jsonPath("$.items[0].frontText").value("질문"));
	}

	@Test
	void 다른payload에재사용된키는409를보존한다() throws Exception {
		when(service.create(eq(USER_ID), any(CreateCardDeckBulkRequest.class))).thenThrow(
			new CardDeckBulkServiceException(
				409,
				"CARD_DECK_BULK_IDEMPOTENCY_CONFLICT",
				"같은 멱등성 키가 다른 덱 생성 요청에 사용되었습니다."
			)
		);

		mockMvc.perform(post("/card-decks/bulk")
			.header("X-Yeon-User-Id", USER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.contentType(MediaType.APPLICATION_JSON)
			.content(validBody()))
			.andExpect(status().isConflict())
			.andExpect(jsonPath("$.code").value("CARD_DECK_BULK_IDEMPOTENCY_CONFLICT"))
			.andExpect(jsonPath("$.message").value("같은 멱등성 키가 다른 덱 생성 요청에 사용되었습니다."));
	}

	@Test
	void 잘못된UUID본문은400이다() throws Exception {
		mockMvc.perform(post("/card-decks/bulk")
			.header("X-Yeon-User-Id", USER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.contentType(MediaType.APPLICATION_JSON)
			.content(validBody().replace(IDEMPOTENCY_KEY.toString(), "not-a-uuid")))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.message").value("요청 본문 형식이 올바르지 않습니다."));
	}

	private CreateCardDeckBulkResponse response() {
		String now = "2026-07-11T00:00:00Z";
		return new CreateCardDeckBulkResponse(
			new CardDeckDto("dck_1", "한국사", "근현대사", 1, now, now),
			List.of(new CardDeckItemDto("dki_1", "질문", "답", null, null, null, null, null, now, now))
		);
	}

	private String validBody() {
		return """
			{
			  "idempotencyKey": "00000000-0000-0000-0000-000000000992",
			  "title": "한국사",
			  "description": "근현대사",
			  "items": [{"frontText": "질문", "backText": "답", "imageStorageKey": null}]
			}
			""";
	}
}
