package world.yeon.backend.card_decks.generation.controller;

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
import world.yeon.backend.card_decks.generation.dto.CardDeckAiDraftItem;
import world.yeon.backend.card_decks.generation.dto.CardDeckAiPreviewRequest;
import world.yeon.backend.card_decks.generation.dto.CardDeckAiPreviewResponse;
import world.yeon.backend.card_decks.generation.service.CardDeckAiPreviewService;

@WebMvcTest(CardDeckAiPreviewController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class CardDeckAiPreviewControllerTests {
	private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000980");
	private static final String IDEMPOTENCY_KEY = "c5ded849-abaa-4b57-8402-9b4265018e72";

	@Autowired private MockMvc mockMvc;
	@MockitoBean private CardDeckAiPreviewService service;

	@Test void 원문으로생성한질문답변미리보기를반환한다() throws Exception {
		var request = new CardDeckAiPreviewRequest(IDEMPOTENCY_KEY, "학습 원문", "핵심 위주", 2);
		when(service.create(eq(USER_ID), eq(request))).thenReturn(new CardDeckAiPreviewResponse(
			"생성 덱",
			null,
			List.of(new CardDeckAiDraftItem("질문", "정답"))
		));

		mockMvc.perform(post("/card-decks/ai-previews")
			.header("X-Yeon-User-Id", USER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
				{"idempotencyKey":"c5ded849-abaa-4b57-8402-9b4265018e72","sourceText":"학습 원문","instruction":"핵심 위주","itemCount":2}
				"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.title").value("생성 덱"))
			.andExpect(jsonPath("$.description").doesNotExist())
			.andExpect(jsonPath("$.items[0].frontText").value("질문"))
			.andExpect(jsonPath("$.items[0].backText").value("정답"));
	}
}
