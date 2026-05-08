package world.yeon.backend.space_access.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import world.yeon.backend.space_access.service.SpaceAccessService;

@WebMvcTest(SpaceAccessController.class)
@ActiveProfiles("jdbc")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class SpaceAccessControllerTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000972");
	@Autowired private MockMvc mockMvc;
	@MockitoBean private SpaceAccessService service;
	@Test void ok응답shape를반환한다() throws Exception {
		when(service.requireOwnedSpace(eq("space-1"), eq(OWNER_ID))).thenReturn(true);
		mockMvc.perform(get("/spaces/space-1/ownership-check").header("X-Yeon-User-Id", OWNER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.ok").value(true));
	}
}
