package world.yeon.backend.public_check_sessions.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.OffsetDateTime;
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
import world.yeon.backend.public_check_sessions.dto.CreatePublicCheckSessionRequest;
import world.yeon.backend.public_check_sessions.dto.CreatePublicCheckSessionResponse;
import world.yeon.backend.public_check_sessions.dto.PublicCheckSessionSummaryResponse;
import world.yeon.backend.public_check_sessions.dto.UpdatePublicCheckSessionRequest;
import world.yeon.backend.public_check_sessions.dto.UpdatePublicCheckSessionResponse;
import world.yeon.backend.public_check_sessions.service.PublicCheckSessionService;

@WebMvcTest(PublicCheckSessionController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class PublicCheckSessionControllerTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000942");
	@Autowired private MockMvc mockMvc;
	@MockitoBean private PublicCheckSessionService service;

	@Test void post응답shape를반환한다() throws Exception {
		when(service.createSession(eq("space_alpha"), eq(OWNER_ID), eq(new CreatePublicCheckSessionRequest("체크인", "attendance_and_assignment", List.of("qr"), null, null, null, null, null, null))))
			.thenReturn(new CreatePublicCheckSessionResponse(
				new PublicCheckSessionSummaryResponse("pcs_1", "체크인", "active", "attendance_and_assignment", List.of("qr"), "/check/token123", null, null, null, null, OffsetDateTime.parse("2026-05-08T07:00:00Z"))
			));
		mockMvc.perform(post("/spaces/space_alpha/public-check-sessions")
				.header("X-Yeon-User-Id", OWNER_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"title\":\"체크인\",\"checkMode\":\"attendance_and_assignment\",\"enabledMethods\":[\"qr\"],\"opensAt\":null,\"closesAt\":null,\"locationLabel\":null,\"latitude\":null,\"longitude\":null,\"radiusMeters\":null}"))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.session.id").value("pcs_1"));
	}

	@Test void patch응답shape를반환한다() throws Exception {
		when(service.updateSession(eq("space_alpha"), eq("pcs_1"), eq(OWNER_ID), eq(new UpdatePublicCheckSessionRequest("closed", "2026-05-08T09:00:00Z"))))
			.thenReturn(new UpdatePublicCheckSessionResponse(
				new PublicCheckSessionSummaryResponse("pcs_1", "체크인", "closed", "attendance_and_assignment", List.of("qr"), "/check/token123", null, OffsetDateTime.parse("2026-05-08T09:00:00Z"), null, null, OffsetDateTime.parse("2026-05-08T07:00:00Z"))
			));
		mockMvc.perform(patch("/spaces/space_alpha/public-check-sessions/pcs_1")
				.header("X-Yeon-User-Id", OWNER_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"status\":\"closed\",\"closesAt\":\"2026-05-08T09:00:00Z\"}"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.session.id").value("pcs_1"))
			.andExpect(jsonPath("$.session.publicPath").value("/check/token123"));
	}
}
