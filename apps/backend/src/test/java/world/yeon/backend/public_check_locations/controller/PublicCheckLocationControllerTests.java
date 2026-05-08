package world.yeon.backend.public_check_locations.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import world.yeon.backend.public_check_locations.dto.PublicCheckLocationResultResponse;
import world.yeon.backend.public_check_locations.dto.PublicCheckLocationSearchResponse;
import world.yeon.backend.public_check_locations.service.PublicCheckLocationService;
import world.yeon.backend.public_check_locations.service.PublicCheckLocationServiceException;

@WebMvcTest(PublicCheckLocationController.class)
@ActiveProfiles("jdbc")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class PublicCheckLocationControllerTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000962");

	@Autowired private MockMvc mockMvc;
	@MockitoBean private PublicCheckLocationService service;

	@Test void search응답shape를반환한다() throws Exception {
		when(service.search(eq(OWNER_ID), eq("space_alpha"), eq("강남"))).thenReturn(
			new PublicCheckLocationSearchResponse(List.of(
				new PublicCheckLocationResultResponse("keyword:1", "강남역 · 서울 강남구 테헤란로", "강남역", "서울 강남구 테헤란로", "서울 강남구", 37.5, 127.0, "keyword")
			))
		);

		mockMvc.perform(get("/spaces/space_alpha/public-check-locations")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.queryParam("query", "강남"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.results[0].id").value("keyword:1"));
	}

	@Test void service에러는상태를유지한다() throws Exception {
		when(service.search(eq(OWNER_ID), eq("space_alpha"), eq("강남")))
			.thenThrow(new PublicCheckLocationServiceException(500, "KAKAO_CONFIG_MISSING", "KAKAO_REST_API_KEY가 설정되지 않았습니다."));

		mockMvc.perform(get("/spaces/space_alpha/public-check-locations")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.queryParam("query", "강남"))
			.andExpect(status().isInternalServerError())
			.andExpect(jsonPath("$.message").value("KAKAO_REST_API_KEY가 설정되지 않았습니다."));
	}
}
