package world.yeon.backend.member_tabs.reorder.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import world.yeon.backend.member_tabs.reorder.dto.OkResponse;
import world.yeon.backend.member_tabs.reorder.service.MemberTabReorderService;

@WebMvcTest(MemberTabReorderController.class)
@ActiveProfiles("jdbc")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class MemberTabReorderControllerTests {

	private static final UUID OWNER_ID =
		UUID.fromString("00000000-0000-0000-0000-000000000401");

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private MemberTabReorderService service;

	@Test
	void reorder는유저헤더가없으면badRequest다() throws Exception {
		mockMvc.perform(
			patch("/spaces/space_alpha/member-tabs/reorder")
				.header("X-Yeon-Internal-Token", "test-internal-token")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{"order":["mtb_a","mtb_b"]}
				""")
		)
			.andExpect(status().isBadRequest());
	}

	@Test
	void reorder는200과ok응답을반환한다() throws Exception {
		when(service.reorderTabs(
			eq("space_alpha"),
			eq(List.of("mtb_hidden", "mtb_overview", "mtb_notes"))
		)).thenReturn(OkResponse.success());

		mockMvc.perform(
			patch("/spaces/space_alpha/member-tabs/reorder")
				.header("X-Yeon-User-Id", OWNER_ID)
				.header("X-Yeon-Internal-Token", "test-internal-token")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{"order":["mtb_hidden","mtb_overview","mtb_notes"]}
				""")
		)
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.ok").value(true));
	}

	@Test
	void reorder는space가없으면404다() throws Exception {
		when(service.reorderTabs(eq("missing"), eq(List.of("mtb_a"))))
			.thenThrow(new NoSuchElementException("스페이스를 찾지 못했습니다."));

		mockMvc.perform(
			patch("/spaces/missing/member-tabs/reorder")
				.header("X-Yeon-User-Id", OWNER_ID)
				.header("X-Yeon-Internal-Token", "test-internal-token")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{"order":["mtb_a"]}
				""")
		)
			.andExpect(status().isNotFound())
			.andExpect(jsonPath("$.code").value("SPACE_NOT_FOUND"))
			.andExpect(jsonPath("$.message").value("스페이스를 찾지 못했습니다."));
	}
}
