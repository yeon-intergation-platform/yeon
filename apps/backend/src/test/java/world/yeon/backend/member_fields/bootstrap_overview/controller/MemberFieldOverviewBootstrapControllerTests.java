package world.yeon.backend.member_fields.bootstrap_overview.controller;

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

import world.yeon.backend.member_fields.bootstrap_overview.dto.OkResponse;
import world.yeon.backend.member_fields.bootstrap_overview.service.MemberFieldOverviewBootstrapService;

@WebMvcTest(MemberFieldOverviewBootstrapController.class)
@ActiveProfiles("jdbc")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class MemberFieldOverviewBootstrapControllerTests {

	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000781");

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private MemberFieldOverviewBootstrapService service;

	@Test
	void bootstrap은ok응답을반환한다() throws Exception {
		when(service.bootstrap(eq("space_alpha"), eq("mtb_overview"), eq(OWNER_ID)))
			.thenReturn(OkResponse.success());

		mockMvc.perform(post("/spaces/space_alpha/member-tabs/mtb_overview/bootstrap-overview-fields")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.ok").value(true));
	}

	@Test
	void overview가아니면400이다() throws Exception {
		when(service.bootstrap(eq("space_alpha"), eq("mtb_custom"), eq(OWNER_ID)))
			.thenThrow(new IllegalArgumentException("개요 탭에서만 기본 필드 초기화를 수행할 수 있습니다."));

		mockMvc.perform(post("/spaces/space_alpha/member-tabs/mtb_custom/bootstrap-overview-fields")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.code").value("OVERVIEW_TAB_ONLY"));
	}

	@Test
	void 탭이없으면404다() throws Exception {
		when(service.bootstrap(eq("space_alpha"), eq("missing"), eq(OWNER_ID)))
			.thenThrow(new NoSuchElementException("탭을 찾지 못했습니다."));

		mockMvc.perform(post("/spaces/space_alpha/member-tabs/missing/bootstrap-overview-fields")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isNotFound())
			.andExpect(jsonPath("$.code").value("TAB_NOT_FOUND"));
	}
}
