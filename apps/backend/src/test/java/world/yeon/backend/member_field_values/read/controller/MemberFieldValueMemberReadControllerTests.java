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

import world.yeon.backend.member_field_values.read.dto.MemberFieldValueDetailedItemResponse;
import world.yeon.backend.member_field_values.read.dto.MemberFieldValueDetailedListResponse;
import world.yeon.backend.member_field_values.read.service.MemberFieldValueReadService;

@WebMvcTest(MemberFieldValueMemberReadController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class MemberFieldValueMemberReadControllerTests {

	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000789");

	@Autowired private MockMvc mockMvc;
	@MockitoBean private MemberFieldValueReadService service;

	@Test
	void values조회는메타데이터포함응답을반환한다() throws Exception {
		when(service.listMemberValues(eq("space_alpha"), eq("mem_1"), eq(List.of("mfd_status"))))
			.thenReturn(new MemberFieldValueDetailedListResponse(List.of(
				new MemberFieldValueDetailedItemResponse("mfd_status", "select", "상태", null, null, null, List.of("in_progress"))
			)));

		mockMvc.perform(get("/spaces/space_alpha/members/mem_1/field-values?fieldDefinitionId=mfd_status")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.accept(MediaType.APPLICATION_JSON))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.values[0].fieldDefinitionId").value("mfd_status"))
			.andExpect(jsonPath("$.values[0].fieldType").value("select"))
			.andExpect(jsonPath("$.values[0].valueJson[0]").value("in_progress"));
	}

	@Test
	void values조회는member가없으면404다() throws Exception {
		when(service.listMemberValues(eq("space_alpha"), eq("missing"), eq(List.of())))
			.thenThrow(new NoSuchElementException("수강생을 찾지 못했습니다."));

		mockMvc.perform(get("/spaces/space_alpha/members/missing/field-values")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.accept(MediaType.APPLICATION_JSON))
			.andExpect(status().isNotFound())
			.andExpect(jsonPath("$.code").value("MEMBER_NOT_FOUND"));
	}
}
