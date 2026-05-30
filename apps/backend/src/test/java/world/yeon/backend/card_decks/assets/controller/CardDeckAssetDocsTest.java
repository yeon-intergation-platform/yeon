package world.yeon.backend.card_decks.assets.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.restdocs.test.autoconfigure.AutoConfigureRestDocs;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import world.yeon.backend.card_decks.assets.dto.CardDeckAssetUploadResponse;
import world.yeon.backend.card_decks.assets.service.CardDeckAssetService;

/**
 * Spring REST Docs: 테스트가 통과해야 API 문서 snippet(build/generated-snippets/)이 만들어진다.
 * springdoc(어노테이션 기반 OpenAPI)과 달리, 실제 요청/응답 예시를 테스트로 보증한다.
 */
@WebMvcTest(CardDeckAssetController.class)
@AutoConfigureRestDocs
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class CardDeckAssetDocsTest {

	@Autowired private MockMvc mockMvc;
	@MockitoBean private CardDeckAssetService service;

	@Test
	void 카드_이미지_업로드_문서_snippet을_생성한다() throws Exception {
		when(service.upload(any())).thenReturn(new CardDeckAssetUploadResponse(
			"card-service/images/abc.png",
			"/api/v1/card-decks/assets/card-service/images/abc.png"));

		MockMultipartFile file =
			new MockMultipartFile("file", "photo.png", "image/png", new byte[] {1, 2, 3});

		mockMvc.perform(
				multipart("/card-decks/assets")
					.file(file)
					.header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isCreated())
			.andDo(document("card-deck-asset-upload"));
	}
}
