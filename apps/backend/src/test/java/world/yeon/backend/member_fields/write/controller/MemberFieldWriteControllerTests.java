package world.yeon.backend.member_fields.write.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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

import com.fasterxml.jackson.databind.ObjectMapper;

import world.yeon.backend.member_fields.read.mapper.MemberFieldReadMapper;
import world.yeon.backend.member_fields.read.model.MemberFieldDefinitionEntity;
import world.yeon.backend.member_fields.write.service.MemberFieldWriteService;
import world.yeon.backend.member_fields.write.service.MemberFieldWriteServiceException;

@WebMvcTest(MemberFieldWriteController.class)
@ActiveProfiles("jdbc")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class MemberFieldWriteControllerTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000783");

	@Autowired private MockMvc mockMvc;
	@MockitoBean private MemberFieldWriteService service;
	@MockitoBean private MemberFieldReadMapper mapper;

	@Test
	void create는201을반환한다() throws Exception {
		MemberFieldDefinitionEntity entity = new MemberFieldDefinitionEntity();
		when(service.create(eq("space_alpha"), eq("mtb_custom"), eq(OWNER_ID), any())).thenReturn(entity);
		when(mapper.toItem(entity)).thenReturn(new world.yeon.backend.member_fields.read.dto.MemberFieldItemResponse("mfd_1", "상태", null, "text", null, false, 0));
		mockMvc.perform(post("/spaces/space_alpha/member-tabs/mtb_custom/fields")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.contentType("application/json")
			.content(new ObjectMapper().writeValueAsString(java.util.Map.of("name", "상태", "fieldType", "text"))))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.field.id").value("mfd_1"));
	}

	@Test
	void update는200을반환한다() throws Exception {
		MemberFieldDefinitionEntity entity = new MemberFieldDefinitionEntity();
		when(service.update(eq("mfd_1"), eq("space_alpha"), any())).thenReturn(entity);
		when(mapper.toItem(entity)).thenReturn(new world.yeon.backend.member_fields.read.dto.MemberFieldItemResponse("mfd_1", "변경", null, "text", null, false, 2));
		mockMvc.perform(patch("/spaces/space_alpha/member-fields/mfd_1")
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.contentType("application/json")
			.content(new ObjectMapper().writeValueAsString(java.util.Map.of("name", "변경"))))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.field.name").value("변경"));
	}

	@Test
	void delete는204를반환한다() throws Exception {
		mockMvc.perform(delete("/spaces/space_alpha/member-fields/mfd_1")
			.header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isNoContent());
	}

	@Test
	void protected오류는403이다() throws Exception {
		when(service.update(eq("mfd_1"), eq("space_alpha"), any()))
			.thenThrow(new MemberFieldWriteServiceException(403, "기본 항목은 이름과 순서만 변경할 수 있습니다.", "FIELD_PROTECTED"));
		mockMvc.perform(patch("/spaces/space_alpha/member-fields/mfd_1")
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.contentType("application/json")
			.content(new ObjectMapper().writeValueAsString(java.util.Map.of("fieldType", "number"))))
			.andExpect(status().isForbidden())
			.andExpect(jsonPath("$.code").value("FIELD_PROTECTED"));
	}
}
