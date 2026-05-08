package world.yeon.backend.import_commit.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
import world.yeon.backend.import_commit.dto.*;
import world.yeon.backend.import_commit.service.ImportCommitService;

@WebMvcTest(ImportCommitController.class)
@ActiveProfiles("jdbc")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class ImportCommitControllerTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000961");
	@Autowired private MockMvc mockMvc;
	@MockitoBean private ImportCommitService service;

	@Test void commit응답shape를반환한다() throws Exception {
		when(service.commitImport(eq(OWNER_ID), eq(new ImportCommitRequest("draft-1", new ImportPreviewRequest(List.of())))))
			.thenReturn(new ImportCommitResponse(new ImportCreatedCountsResponse(1, 2), List.of("space-1")));
		mockMvc.perform(post("/import-commit").header("X-Yeon-User-Id", OWNER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token").contentType(MediaType.APPLICATION_JSON).content("{\"draftId\":\"draft-1\",\"preview\":{\"cohorts\":[]}}"))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.created.spaces").value(1))
			.andExpect(jsonPath("$.spaceIds[0]").value("space-1"));
	}
}
