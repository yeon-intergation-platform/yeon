package world.yeon.backend.card_decks.assets.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import world.yeon.backend.card_decks.assets.dto.CardDeckAssetUploadResponse;
import world.yeon.backend.card_decks.assets.service.CardDeckAssetService;
import world.yeon.backend.card_decks.assets.service.CardDeckAssetServiceException;
import world.yeon.backend.card_decks.assets.service.CardDeckAssetStorage;

@WebMvcTest(CardDeckAssetController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class CardDeckAssetControllerTests {
	@Autowired private MockMvc mockMvc;
	@MockitoBean private CardDeckAssetService service;

	@Test void 업로드응답shape를반환한다() throws Exception {
		when(service.upload(any())).thenReturn(new CardDeckAssetUploadResponse("card-service/images/a.png", "/api/v1/card-decks/assets/card-service%2Fimages%2Fa.png"));
		MockMultipartFile file = new MockMultipartFile("file", "a.png", "image/png", new byte[] {1, 2, 3});

		mockMvc.perform(multipart("/card-decks/assets").file(file).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.storageKey").value("card-service/images/a.png"))
			.andExpect(jsonPath("$.imageUrl").value("/api/v1/card-decks/assets/card-service%2Fimages%2Fa.png"));
	}

	@Test void 다운로드헤더를보존한다() throws Exception {
		when(service.read(anyString())).thenReturn(new CardDeckAssetStorage.StoredAsset(new byte[] {1, 2, 3}, "image/png", "public, max-age=31536000, immutable"));

		mockMvc.perform(get("/card-decks/assets/card-service%2Fimages%2Fa.png").header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(header().string("content-type", "image/png"))
			.andExpect(header().string("cache-control", "public, max-age=31536000, immutable"));
	}

	@Test void service오류는상태코드를보존한다() throws Exception {
		when(service.read(anyString())).thenThrow(new CardDeckAssetServiceException(404, "CARD_ASSET_NOT_FOUND", "이미지를 찾지 못했습니다."));

		mockMvc.perform(get("/card-decks/assets/missing.png").header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isNotFound())
			.andExpect(jsonPath("$.message").value("이미지를 찾지 못했습니다."));
	}
}
