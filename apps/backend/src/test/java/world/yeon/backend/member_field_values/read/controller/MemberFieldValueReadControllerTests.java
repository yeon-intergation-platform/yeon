package world.yeon.backend.member_field_values.read.controller;

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

import world.yeon.backend.member_field_values.read.dto.MemberFieldValueItemResponse;
import world.yeon.backend.member_field_values.read.dto.MemberFieldValueListResponse;
import world.yeon.backend.member_field_values.read.service.MemberFieldValueReadService;

@WebMvcTest(MemberFieldValueReadController.class)
@ActiveProfiles("jdbc")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class MemberFieldValueReadControllerTests {

	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000701");

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private MemberFieldValueReadService service;

	@Test
	void values조회는memberId가없으면badRequest다() throws Exception {
		mockMvc.perform(get("/spaces/space_alpha/member-tabs/mtb_custom/field-values")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.accept(MediaType.APPLICATION_JSON))
			.andExpect(status().isBadRequest());
	}

	@Test
	void values조회는values응답을반환한다() throws Exception {
		when(service.listValues(eq("space_alpha"), eq("mtb_custom"), eq("mem_1")))
			.thenReturn(new MemberFieldValueListResponse(List.of(
				new MemberFieldValueItemResponse("mfd_status", null, null, null, List.of("in_progress"))
			)));
		mockMvc.perform(get("/spaces/space_alpha/member-tabs/mtb_custom/field-values?memberId=mem_1")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.accept(MediaType.APPLICATION_JSON))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.values[0].fieldDefinitionId").value("mfd_status"))
			.andExpect(jsonPath("$.values[0].valueJson[0]").value("in_progress"));
	}

	@Test
	void values조회는member가없으면404다() throws Exception {
		when(service.listValues(eq("space_alpha"), eq("mtb_custom"), eq("missing")))
			.thenThrow(new NoSuchElementException("수강생을 찾지 못했습니다."));
		mockMvc.perform(get("/spaces/space_alpha/member-tabs/mtb_custom/field-values?memberId=missing")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.accept(MediaType.APPLICATION_JSON))
			.andExpect(status().isNotFound())
			.andExpect(jsonPath("$.code").value("MEMBER_NOT_FOUND"));
	}
}
