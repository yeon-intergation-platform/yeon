package world.yeon.backend.member_field_values.write.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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

import world.yeon.backend.member_field_values.write.dto.MemberFieldValueMutationItemResponse;
import world.yeon.backend.member_field_values.write.dto.MemberFieldValuesMutationResponse;
import world.yeon.backend.member_field_values.write.service.MemberFieldValueWriteService;
import world.yeon.backend.member_field_values.write.service.MemberFieldValueWriteServiceException;

@WebMvcTest(MemberFieldValueWriteController.class)
@ActiveProfiles("jdbc")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class MemberFieldValueWriteControllerTests {

	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000788");

	@Autowired private MockMvc mockMvc;
	@MockitoBean private MemberFieldValueWriteService service;

	@Test
	void patch는200과values응답을반환한다() throws Exception {
		when(service.bulkUpsert(eq("space_alpha"), eq("mem_1"), eq(OWNER_ID), org.mockito.ArgumentMatchers.any()))
			.thenReturn(MemberFieldValuesMutationResponse.success(List.of(
				new MemberFieldValueMutationItemResponse("mfd_status", "select", "상태", null, null, null, List.of("in_progress"))
			)));

		mockMvc.perform(patch("/spaces/space_alpha/members/mem_1/field-values")
			.header("X-Yeon-User-Id", OWNER_ID)
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.contentType(MediaType.APPLICATION_JSON)
			.content("{\"values\":[{\"fieldDefinitionId\":\"mfd_status\",\"value\":[\"in_progress\"]}]}"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.ok").value(true))
			.andExpect(jsonPath("$.values[0].fieldDefinitionId").value("mfd_status"));
	}

	@Test
	void patch는필드정의가없으면404다() throws Exception {
		when(service.bulkUpsert(eq("space_alpha"), eq("mem_1"), eq(OWNER_ID), org.mockito.ArgumentMatchers.any()))
			.thenThrow(new MemberFieldValueWriteServiceException(404, "필드 정의를 찾지 못했습니다.", "FIELD_DEFINITION_NOT_FOUND"));

		mockMvc.perform(patch("/spaces/space_alpha/members/mem_1/field-values")
			.header("X-Yeon-User-Id", OWNER_ID)
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.contentType(MediaType.APPLICATION_JSON)
			.content("{\"values\":[{\"fieldDefinitionId\":\"missing\",\"value\":\"x\"}]}"))
			.andExpect(status().isNotFound())
			.andExpect(jsonPath("$.code").value("FIELD_DEFINITION_NOT_FOUND"));
	}
}
