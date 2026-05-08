package world.yeon.backend.spaces.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
import world.yeon.backend.spaces.dto.CreateSpaceRequest;
import world.yeon.backend.spaces.dto.OkResponse;
import world.yeon.backend.spaces.dto.SpaceListResponse;
import world.yeon.backend.spaces.dto.SpaceMutationResponse;
import world.yeon.backend.spaces.dto.SpaceResponse;
import world.yeon.backend.spaces.dto.UpdateSpaceRequest;
import world.yeon.backend.spaces.service.SpaceService;
import world.yeon.backend.spaces.service.SpaceServiceException;

@WebMvcTest(SpaceController.class)
@ActiveProfiles("jdbc")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class SpaceControllerTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000942");

	@Autowired private MockMvc mockMvc;
	@MockitoBean private SpaceService service;

	@Test void list응답shape를반환한다() throws Exception {
		when(service.listSpaces(eq(OWNER_ID))).thenReturn(new SpaceListResponse(List.of(
			new SpaceResponse("spc_alpha", "알파", null, null, null, OWNER_ID.toString(), OffsetDateTime.parse("2026-05-08T07:00:00Z"), OffsetDateTime.parse("2026-05-08T07:00:00Z"))
		)));

		mockMvc.perform(get("/spaces").header("X-Yeon-User-Id", OWNER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.spaces[0].id").value("spc_alpha"));
	}

	@Test void create응답shape를반환한다() throws Exception {
		when(service.createSpace(eq(OWNER_ID), eq(new CreateSpaceRequest("알파", null, "2026-05-01", "2026-05-31"))))
			.thenReturn(new SpaceMutationResponse(new SpaceResponse("spc_alpha", "알파", null, "2026-05-01", "2026-05-31", OWNER_ID.toString(), OffsetDateTime.parse("2026-05-08T07:00:00Z"), OffsetDateTime.parse("2026-05-08T07:00:00Z"))));

		mockMvc.perform(post("/spaces").header("X-Yeon-User-Id", OWNER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"알파\",\"startDate\":\"2026-05-01\",\"endDate\":\"2026-05-31\"}"))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.space.id").value("spc_alpha"));
	}

	@Test void update응답shape를반환한다() throws Exception {
		when(service.updateSpace(eq(OWNER_ID), eq("spc_alpha"), eq(new UpdateSpaceRequest("알파 변경", null, null))))
			.thenReturn(new SpaceMutationResponse(new SpaceResponse("spc_alpha", "알파 변경", null, null, null, OWNER_ID.toString(), OffsetDateTime.parse("2026-05-08T07:00:00Z"), OffsetDateTime.parse("2026-05-08T08:00:00Z"))));

		mockMvc.perform(patch("/spaces/spc_alpha").header("X-Yeon-User-Id", OWNER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"알파 변경\"}"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.space.name").value("알파 변경"));
	}

	@Test void delete는ok응답을반환한다() throws Exception {
		when(service.deleteSpace(eq(OWNER_ID), eq("spc_alpha"))).thenReturn(OkResponse.success());

		mockMvc.perform(delete("/spaces/spc_alpha").header("X-Yeon-User-Id", OWNER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.ok").value(true));
	}

	@Test void notFound는404를반환한다() throws Exception {
		when(service.getSpace(eq(OWNER_ID), eq("spc_missing")))
			.thenThrow(new SpaceServiceException(404, "SPACE_NOT_FOUND", "스페이스를 찾지 못했습니다."));

		mockMvc.perform(get("/spaces/spc_missing").header("X-Yeon-User-Id", OWNER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isNotFound())
			.andExpect(jsonPath("$.message").value("스페이스를 찾지 못했습니다."));
	}
}
