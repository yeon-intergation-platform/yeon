package world.yeon.backend.googledrive_oauth.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import world.yeon.backend.googledrive_oauth.dto.GoogleDriveOAuthUrlResponse;
import world.yeon.backend.googledrive_oauth.service.GoogleDriveOAuthService;
import world.yeon.backend.googledrive_oauth.service.GoogleDriveOAuthServiceException;

@WebMvcTest(GoogleDriveOAuthController.class)
@ActiveProfiles("jdbc")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class GoogleDriveOAuthControllerTests {
	private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000987");
	@Autowired private MockMvc mockMvc;
	@MockitoBean private GoogleDriveOAuthService service;

	@Test void oauthUrl을반환한다() throws Exception {
		when(service.buildOAuthUrl(eq("state-1"))).thenReturn(new GoogleDriveOAuthUrlResponse("https://accounts.google.com/test"));
		mockMvc.perform(get("/googledrive/oauth-url").queryParam("state", "state-1").header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.url").value("https://accounts.google.com/test"));
	}

	@Test void callback은200을반환한다() throws Exception {
		mockMvc.perform(post("/googledrive/oauth-callback").header("X-Yeon-User-Id", USER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token").contentType(MediaType.APPLICATION_JSON).content("{\"code\":\"code-1\"}"))
			.andExpect(status().isOk());
	}

	@Test void service오류는상태코드를보존한다() throws Exception {
		doThrow(new GoogleDriveOAuthServiceException(502, "GOOGLE_OAUTH_EXCHANGE_FAILED", "Google 토큰 교환 실패")).when(service).exchangeAndSave(eq(USER_ID), eq("code-1"));
		mockMvc.perform(post("/googledrive/oauth-callback").header("X-Yeon-User-Id", USER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token").contentType(MediaType.APPLICATION_JSON).content("{\"code\":\"code-1\"}"))
			.andExpect(status().isBadGateway())
			.andExpect(jsonPath("$.message").value("Google 토큰 교환 실패"));
	}
}
