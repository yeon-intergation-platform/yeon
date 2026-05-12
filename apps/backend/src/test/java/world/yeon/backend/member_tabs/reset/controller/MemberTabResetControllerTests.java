package world.yeon.backend.member_tabs.reset.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.NoSuchElementException;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import world.yeon.backend.member_tabs.reset.dto.OkResponse;
import world.yeon.backend.member_tabs.reset.service.MemberTabResetService;

@WebMvcTest(MemberTabResetController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class MemberTabResetControllerTests {

	private static final UUID OWNER_ID =
		UUID.fromString("00000000-0000-0000-0000-000000000501");

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private MemberTabResetService service;

	@Test
	void reset은유저헤더가없으면badRequest다() throws Exception {
		mockMvc.perform(
			post("/spaces/space_alpha/member-tabs/reset")
				.header("X-Yeon-Internal-Token", "test-internal-token")
		)
			.andExpect(status().isBadRequest());
	}

	@Test
	void reset은200과ok응답을반환한다() throws Exception {
		when(service.resetTabs(eq("space_alpha"))).thenReturn(OkResponse.success());

		mockMvc.perform(
			post("/spaces/space_alpha/member-tabs/reset")
				.header("X-Yeon-User-Id", OWNER_ID)
				.header("X-Yeon-Internal-Token", "test-internal-token")
		)
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.ok").value(true));
	}

	@Test
	void reset은space가없으면404다() throws Exception {
		when(service.resetTabs(eq("missing")))
			.thenThrow(new NoSuchElementException("스페이스를 찾지 못했습니다."));

		mockMvc.perform(
			post("/spaces/missing/member-tabs/reset")
				.header("X-Yeon-User-Id", OWNER_ID)
				.header("X-Yeon-Internal-Token", "test-internal-token")
		)
			.andExpect(status().isNotFound())
			.andExpect(jsonPath("$.code").value("SPACE_NOT_FOUND"))
			.andExpect(jsonPath("$.message").value("스페이스를 찾지 못했습니다."));
	}
}
