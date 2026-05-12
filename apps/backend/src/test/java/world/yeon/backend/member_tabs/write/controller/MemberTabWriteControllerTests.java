package world.yeon.backend.member_tabs.write.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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

import world.yeon.backend.member_tabs.write.dto.CreateMemberTabRequest;
import world.yeon.backend.member_tabs.write.dto.MemberTabMutationItemResponse;
import world.yeon.backend.member_tabs.write.dto.MemberTabMutationResponse;
import world.yeon.backend.member_tabs.write.dto.UpdateMemberTabRequest;
import world.yeon.backend.member_tabs.write.service.MemberTabWriteService;

@WebMvcTest(MemberTabWriteController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class MemberTabWriteControllerTests {

	private static final UUID OWNER_ID =
		UUID.fromString("00000000-0000-0000-0000-000000000201");

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private MemberTabWriteService service;

	@Test
	void 생성은유저헤더가없으면badRequest다() throws Exception {
		mockMvc.perform(
			post("/spaces/space_alpha/member-tabs")
				.header("X-Yeon-Internal-Token", "test-internal-token")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{"name":"상담 메모"}
				""")
		)
			.andExpect(status().isBadRequest());
	}

	@Test
	void 생성은201과tab응답을반환한다() throws Exception {
		when(service.createCustomTab(
			eq("space_alpha"),
			eq(OWNER_ID),
			eq(new CreateMemberTabRequest("상담 메모"))
		)).thenReturn(new MemberTabMutationResponse(
			new MemberTabMutationItemResponse(
				"mtb_created",
				"상담 메모",
				"custom",
				null,
				true,
				5
			)
		));

		mockMvc.perform(
			post("/spaces/space_alpha/member-tabs")
				.header("X-Yeon-User-Id", OWNER_ID)
				.header("X-Yeon-Internal-Token", "test-internal-token")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{"name":"상담 메모"}
				""")
		)
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.tab.id").value("mtb_created"))
			.andExpect(jsonPath("$.tab.displayOrder").value(5));
	}

	@Test
	void 수정은200과tab응답을반환한다() throws Exception {
		when(service.updateTab(
			eq("mtb_custom"),
			eq("space_alpha"),
			eq(new UpdateMemberTabRequest("새 이름", false, 7))
		)).thenReturn(new MemberTabMutationResponse(
			new MemberTabMutationItemResponse(
				"mtb_custom",
				"새 이름",
				"custom",
				null,
				false,
				7
			)
		));

		mockMvc.perform(
			patch("/spaces/space_alpha/member-tabs/mtb_custom")
				.header("X-Yeon-User-Id", OWNER_ID)
				.header("X-Yeon-Internal-Token", "test-internal-token")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{"name":"새 이름","isVisible":false,"displayOrder":7}
				""")
		)
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.tab.name").value("새 이름"))
			.andExpect(jsonPath("$.tab.isVisible").value(false));
	}

	@Test
	void 수정금지는403으로번역한다() throws Exception {
		doThrow(new IllegalStateException("기본 탭은 수정할 수 없습니다."))
			.when(service)
			.updateTab(eq("mtb_overview"), eq("space_alpha"), eq(new UpdateMemberTabRequest("변경", null, null)));

		mockMvc.perform(
			patch("/spaces/space_alpha/member-tabs/mtb_overview")
				.header("X-Yeon-User-Id", OWNER_ID)
				.header("X-Yeon-Internal-Token", "test-internal-token")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{"name":"변경"}
				""")
		)
			.andExpect(status().isForbidden())
			.andExpect(jsonPath("$.code").value("PROTECTED_SYSTEM_TAB"));
	}

	@Test
	void 삭제는204를반환한다() throws Exception {
		doNothing().when(service).deleteCustomTab("mtb_custom", "space_alpha");

		mockMvc.perform(
			delete("/spaces/space_alpha/member-tabs/mtb_custom")
				.header("X-Yeon-User-Id", OWNER_ID)
				.header("X-Yeon-Internal-Token", "test-internal-token")
		)
			.andExpect(status().isNoContent());
	}

	@Test
	void 삭제미존재는404로번역한다() throws Exception {
		doThrow(new NoSuchElementException("탭을 찾지 못했습니다."))
			.when(service)
			.deleteCustomTab("missing", "space_alpha");

		mockMvc.perform(
			delete("/spaces/space_alpha/member-tabs/missing")
				.header("X-Yeon-User-Id", OWNER_ID)
				.header("X-Yeon-Internal-Token", "test-internal-token")
		)
			.andExpect(status().isNotFound())
			.andExpect(jsonPath("$.code").value("MEMBER_TAB_NOT_FOUND"));
	}
}
