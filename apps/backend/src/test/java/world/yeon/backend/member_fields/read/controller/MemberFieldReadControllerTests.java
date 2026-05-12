package world.yeon.backend.member_fields.read.controller;

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

import world.yeon.backend.member_fields.read.dto.MemberFieldItemResponse;
import world.yeon.backend.member_fields.read.dto.MemberFieldListResponse;
import world.yeon.backend.member_fields.read.service.MemberFieldReadService;

@WebMvcTest(MemberFieldReadController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class MemberFieldReadControllerTests {

	private static final UUID OWNER_ID =
		UUID.fromString("00000000-0000-0000-0000-000000000601");

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private MemberFieldReadService service;

	@Test
	void field목록조회는유저헤더가없으면badRequest다() throws Exception {
		mockMvc.perform(
			get("/spaces/space_alpha/member-tabs/mtb_custom/fields")
				.header("X-Yeon-Internal-Token", "test-internal-token")
				.accept(MediaType.APPLICATION_JSON)
		)
			.andExpect(status().isBadRequest());
	}

	@Test
	void field목록조회는fields응답을반환한다() throws Exception {
		when(service.listFields(eq("space_alpha"), eq("mtb_custom")))
			.thenReturn(new MemberFieldListResponse(List.of(
				new MemberFieldItemResponse("mfd_status", "상태", null, "select", List.of(java.util.Map.of("value", "in_progress", "color", "#818cf8")), false, 0)
			)));

		mockMvc.perform(
			get("/spaces/space_alpha/member-tabs/mtb_custom/fields")
				.header("X-Yeon-User-Id", OWNER_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token")
				.accept(MediaType.APPLICATION_JSON)
		)
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.fields[0].id").value("mfd_status"))
			.andExpect(jsonPath("$.fields[0].options[0].value").value("in_progress"));
	}

	@Test
	void field목록조회는space가없으면404다() throws Exception {
		when(service.listFields(eq("missing_space"), eq("mtb_custom")))
			.thenThrow(new NoSuchElementException("스페이스를 찾지 못했습니다."));

		mockMvc.perform(
			get("/spaces/missing_space/member-tabs/mtb_custom/fields")
				.header("X-Yeon-User-Id", OWNER_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token")
				.accept(MediaType.APPLICATION_JSON)
		)
			.andExpect(status().isNotFound())
			.andExpect(jsonPath("$.code").value("SPACE_NOT_FOUND"));
	}

	@Test
	void field목록조회는tab이없으면404다() throws Exception {
		when(service.listFields(eq("space_alpha"), eq("missing_tab")))
			.thenThrow(new NoSuchElementException("탭을 찾지 못했습니다."));

		mockMvc.perform(
			get("/spaces/space_alpha/member-tabs/missing_tab/fields")
				.header("X-Yeon-User-Id", OWNER_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token")
				.accept(MediaType.APPLICATION_JSON)
		)
			.andExpect(status().isNotFound())
			.andExpect(jsonPath("$.code").value("TAB_NOT_FOUND"));
	}

	@Test
	void field목록조회는tabSpaceMismatch면400이다() throws Exception {
		when(service.listFields(eq("space_alpha"), eq("mtb_other")))
			.thenThrow(new IllegalArgumentException("탭이 스페이스에 속하지 않습니다."));

		mockMvc.perform(
			get("/spaces/space_alpha/member-tabs/mtb_other/fields")
				.header("X-Yeon-User-Id", OWNER_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token")
				.accept(MediaType.APPLICATION_JSON)
		)
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.code").value("TAB_SPACE_MISMATCH"));
	}
}
