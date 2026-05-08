package world.yeon.backend.card_decks.merge_guest.controller;

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
import world.yeon.backend.card_decks.merge_guest.dto.MergeGuestCardDeckItemRequest;
import world.yeon.backend.card_decks.merge_guest.dto.MergeGuestCardDeckRequest;
import world.yeon.backend.card_decks.merge_guest.dto.MergeGuestRequest;
import world.yeon.backend.card_decks.merge_guest.dto.MergeGuestResponse;
import world.yeon.backend.card_decks.merge_guest.service.MergeGuestCardDeckService;
import world.yeon.backend.card_decks.merge_guest.service.MergeGuestCardDeckServiceException;

@WebMvcTest(MergeGuestCardDeckController.class)
@ActiveProfiles("jdbc")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class MergeGuestCardDeckControllerTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000952");

	@Autowired private MockMvc mockMvc;
	@MockitoBean private MergeGuestCardDeckService service;

	@Test void merge응답shape를반환한다() throws Exception {
		when(service.merge(eq(OWNER_ID), eq(new MergeGuestRequest(List.of(
			new MergeGuestCardDeckRequest("덱", null, List.of(new MergeGuestCardDeckItemRequest("앞", "뒤")))
		))))).thenReturn(new MergeGuestResponse(1, 1));

		mockMvc.perform(post("/card-decks/merge-guest")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.contentType(MediaType.APPLICATION_JSON)
			.content("{\"decks\":[{\"title\":\"덱\",\"items\":[{\"frontText\":\"앞\",\"backText\":\"뒤\"}]}]}"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.createdDeckCount").value(1))
			.andExpect(jsonPath("$.createdItemCount").value(1));
	}

	@Test void 빈제목은400이다() throws Exception {
		when(service.merge(eq(OWNER_ID), eq(new MergeGuestRequest(List.of(
			new MergeGuestCardDeckRequest(" ", null, List.of())
		))))).thenThrow(new MergeGuestCardDeckServiceException(400, "EMPTY_DECK_TITLE", "덱 제목은 비워 둘 수 없습니다."));

		mockMvc.perform(post("/card-decks/merge-guest")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.contentType(MediaType.APPLICATION_JSON)
			.content("{\"decks\":[{\"title\":\" \",\"items\":[]}]}"))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.message").value("덱 제목은 비워 둘 수 없습니다."));
	}
}
