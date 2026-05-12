package world.yeon.backend.typing_decks.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
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
import world.yeon.backend.typing_decks.dto.CreateTypingDeckRequest;
import world.yeon.backend.typing_decks.dto.CreateTypingRaceSeedRequest;
import world.yeon.backend.typing_decks.dto.TypingDeckDetailResponse;
import world.yeon.backend.typing_decks.dto.TypingDeckDto;
import world.yeon.backend.typing_decks.dto.TypingDeckListResponse;
import world.yeon.backend.typing_decks.dto.TypingDeckPassageDto;
import world.yeon.backend.typing_decks.dto.TypingDeckResponse;
import world.yeon.backend.typing_decks.dto.TypingRaceSeedDto;
import world.yeon.backend.typing_decks.dto.TypingRaceSeedResponse;
import world.yeon.backend.typing_decks.service.TypingDeckService;
import world.yeon.backend.typing_decks.service.TypingDeckServiceException;

@WebMvcTest(TypingDeckController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class TypingDeckControllerTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000982");

	@Autowired private MockMvc mockMvc;
	@MockitoBean private TypingDeckService service;

	@Test void list응답shape를반환한다() throws Exception {
		when(service.listTypingDecks(eq(OWNER_ID), eq("all"), eq("ko"), eq(false))).thenReturn(new TypingDeckListResponse(List.of(
			new TypingDeckDto("tdk_1", "덱", null, "ko", "public", "user", 1, true, true, "2026-05-08T00:00:00Z", "2026-05-08T00:00:00Z")
		)));

		mockMvc.perform(get("/typing-decks?scope=all&languageTag=ko")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.decks[0].id").value("tdk_1"));
	}

	@Test void create응답shape를반환한다() throws Exception {
		when(service.createTypingDeck(eq(OWNER_ID), eq(new CreateTypingDeckRequest("새 덱", null, "ko", "private")), eq(false)))
			.thenReturn(new TypingDeckResponse(new TypingDeckDto("tdk_1", "새 덱", null, "ko", "private", "user", 0, true, true, "2026-05-08T00:00:00Z", "2026-05-08T00:00:00Z")));

		mockMvc.perform(post("/typing-decks")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.contentType(MediaType.APPLICATION_JSON)
			.content("{\"title\":\"새 덱\",\"description\":null,\"languageTag\":\"ko\",\"visibility\":\"private\"}"))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.deck.id").value("tdk_1"));
	}

	@Test void detail과RaceSeed응답shape를반환한다() throws Exception {
		when(service.getTypingDeckDetail(eq(OWNER_ID), eq("tdk_1"), eq(false))).thenReturn(new TypingDeckDetailResponse(
			new TypingDeckDto("tdk_1", "덱", null, "ko", "public", "user", 1, true, true, "2026-05-08T00:00:00Z", "2026-05-08T00:00:00Z"),
			List.of(new TypingDeckPassageDto("tps_1", "제목", "문장", "short", "normal", 0, "2026-05-08T00:00:00Z", "2026-05-08T00:00:00Z"))
		));
		when(service.createTypingRaceSeed(eq(OWNER_ID), eq("tdk_1"), eq(new CreateTypingRaceSeedRequest("tps_1"))))
			.thenReturn(new TypingRaceSeedResponse(new TypingRaceSeedDto("tps_1", "문장", "제목", "v1.token", "tdk_1", "public", "덱", "덱", "ko")));

		mockMvc.perform(get("/typing-decks/tdk_1")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.passages[0].id").value("tps_1"));

		mockMvc.perform(post("/typing-decks/tdk_1/race-seed")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.contentType(MediaType.APPLICATION_JSON)
			.content("{\"passageId\":\"tps_1\"}"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.raceSeed.seedToken").value("v1.token"));
	}

	@Test void delete는204를반환한다() throws Exception {
		mockMvc.perform(delete("/typing-decks/tdk_1")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isNoContent());
	}

	@Test void service오류는상태코드를보존한다() throws Exception {
		when(service.getTypingDeckDetail(eq(null), eq("tdk_missing"), eq(false)))
			.thenThrow(new TypingDeckServiceException(404, "DECK_NOT_FOUND", "타자 덱을 찾지 못했습니다."));

		mockMvc.perform(get("/typing-decks/tdk_missing")
			.header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isNotFound())
			.andExpect(jsonPath("$.message").value("타자 덱을 찾지 못했습니다."));
	}
}
