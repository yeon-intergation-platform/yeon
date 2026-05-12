package world.yeon.backend.home_insight_banners.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
import world.yeon.backend.home_insight_banners.dto.*;
import world.yeon.backend.home_insight_banners.service.HomeInsightBannerService;

@WebMvcTest(HomeInsightBannerController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class HomeInsightBannerControllerTests {
	private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000982");
	@Autowired private MockMvc mockMvc;
	@MockitoBean private HomeInsightBannerService service;
	@Test void get응답shape를반환한다() throws Exception {
		when(service.list(eq(USER_ID))).thenReturn(new HomeInsightBannerStateResponse(List.of(new HomeInsightBannerDismissalResponse("counseling_none", null), new HomeInsightBannerDismissalResponse("counseling_warning", null))));
		mockMvc.perform(get("/home/insight-banners").header("X-Yeon-User-Id", USER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.dismissals[0].bannerKey").value("counseling_none"));
	}
	@Test void post응답shape를반환한다() throws Exception {
		when(service.dismiss(eq(USER_ID), eq(new DismissHomeInsightBannerRequest("counseling_none")))).thenReturn(new DismissHomeInsightBannerResponse(new HomeInsightBannerDismissalResponse("counseling_none", "2026-05-08T06:00:00Z")));
		mockMvc.perform(post("/home/insight-banners/dismiss").header("X-Yeon-User-Id", USER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token").contentType(MediaType.APPLICATION_JSON).content("{\"bannerKey\":\"counseling_none\"}"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.dismissal.bannerKey").value("counseling_none"));
	}
}
