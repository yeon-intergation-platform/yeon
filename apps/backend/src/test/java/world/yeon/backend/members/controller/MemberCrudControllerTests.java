package world.yeon.backend.members.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.OffsetDateTime;
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

import world.yeon.backend.members.dto.*;
import world.yeon.backend.members.service.MemberCrudService;

@WebMvcTest(MemberCrudController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class MemberCrudControllerTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000912");
	@Autowired private MockMvc mockMvc;
	@MockitoBean private MemberCrudService service;

	@Test void list응답shape를반환한다() throws Exception {
		when(service.getMembers(eq("space_alpha"), eq(OWNER_ID))).thenReturn(new GetMembersResponse(List.of(
			new MemberResponse("mem_1", "space_alpha", "홍길동", null, null, "active", null, OffsetDateTime.parse("2026-05-08T07:00:00Z"), OffsetDateTime.parse("2026-05-08T07:00:00Z"))
		)));
		mockMvc.perform(get("/spaces/space_alpha/members").header("X-Yeon-User-Id", OWNER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk()).andExpect(jsonPath("$.members[0].id").value("mem_1"));
	}

	@Test void create응답shape를반환한다() throws Exception {
		when(service.createMember(eq("space_alpha"), eq(OWNER_ID), eq(new CreateMemberRequest("홍길동", null, null, null, null))))
			.thenReturn(new CreateMemberResponse(new MemberResponse("mem_1", "space_alpha", "홍길동", null, null, "active", null, OffsetDateTime.parse("2026-05-08T07:00:00Z"), OffsetDateTime.parse("2026-05-08T07:00:00Z"))));
		mockMvc.perform(post("/spaces/space_alpha/members").header("X-Yeon-User-Id", OWNER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"홍길동\"}"))
			.andExpect(status().isCreated()).andExpect(jsonPath("$.member.id").value("mem_1"));
	}

	@Test void globalGet응답shape를반환한다() throws Exception {
		when(service.getOwnedMember(eq("mem_1"), eq(OWNER_ID))).thenReturn(new GetMemberResponse(new MemberResponse("mem_1", "space_alpha", "홍길동", null, null, "active", null, OffsetDateTime.parse("2026-05-08T07:00:00Z"), OffsetDateTime.parse("2026-05-08T07:00:00Z"))));
		mockMvc.perform(get("/members/mem_1").header("X-Yeon-User-Id", OWNER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk()).andExpect(jsonPath("$.member.spaceId").value("space_alpha"));
	}
}
