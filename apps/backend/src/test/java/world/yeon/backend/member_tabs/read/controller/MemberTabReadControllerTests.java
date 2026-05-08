package world.yeon.backend.member_tabs.read.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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

import world.yeon.backend.member_tabs.read.dto.MemberTabItemResponse;
import world.yeon.backend.member_tabs.read.dto.MemberTabListResponse;
import world.yeon.backend.member_tabs.read.service.MemberTabReadService;

@WebMvcTest(MemberTabReadController.class)
@ActiveProfiles("jdbc")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class MemberTabReadControllerTests {

	private static final UUID OWNER_ID =
		UUID.fromString("00000000-0000-0000-0000-000000000101");

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private MemberTabReadService service;

	@Test
	void 목록조회는유저헤더가없으면badRequest다() throws Exception {
		mockMvc.perform(
			get("/spaces/space_alpha/member-tabs")
				.header("X-Yeon-Internal-Token", "test-internal-token")
				.accept(MediaType.APPLICATION_JSON)
		)
			.andExpect(status().isBadRequest());
	}

	@Test
	void 목록조회는internalToken이없어도controllerContract단에서는service호출결과를검증한다() throws Exception {
		when(service.listTabs(eq("space_alpha")))
			.thenReturn(new MemberTabListResponse(List.of()));

		mockMvc.perform(
			get("/spaces/space_alpha/member-tabs")
				.header("X-Yeon-User-Id", OWNER_ID.toString())
				.accept(MediaType.APPLICATION_JSON)
		)
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.tabs").isArray());
	}

	@Test
	void 목록조회는tabs응답을반환한다() throws Exception {
		when(service.listTabs(eq("space_alpha")))
			.thenReturn(
				new MemberTabListResponse(
					List.of(
						new MemberTabItemResponse(
							"mtb_overview",
							"개요",
							"system",
							"overview",
							true,
							0
						),
						new MemberTabItemResponse(
							"mtb_custom",
							"상담 메모",
							"custom",
							null,
							false,
							1
						)
					)
				)
			);

		mockMvc.perform(
			get("/spaces/space_alpha/member-tabs")
				.header("X-Yeon-User-Id", OWNER_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token")
				.accept(MediaType.APPLICATION_JSON)
		)
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.tabs[0].id").value("mtb_overview"))
			.andExpect(jsonPath("$.tabs[0].systemKey").value("overview"))
			.andExpect(jsonPath("$.tabs[1].isVisible").value(false));
	}

	@Test
	void 목록조회는space가없으면notFound다() throws Exception {
		when(service.listTabs(eq("missing_space")))
			.thenThrow(new NoSuchElementException("스페이스를 찾지 못했습니다."));

		mockMvc.perform(
			get("/spaces/missing_space/member-tabs")
				.header("X-Yeon-User-Id", OWNER_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token")
				.accept(MediaType.APPLICATION_JSON)
		)
			.andExpect(status().isNotFound())
			.andExpect(jsonPath("$.code").value("SPACE_NOT_FOUND"))
			.andExpect(jsonPath("$.message").value("스페이스를 찾지 못했습니다."));
	}
}
