package world.yeon.backend.import_drafts.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
import world.yeon.backend.import_drafts.dto.*;
import world.yeon.backend.import_drafts.service.ImportDraftService;

@WebMvcTest(ImportDraftController.class)
@ActiveProfiles("jdbc")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class ImportDraftControllerTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000951");
	@Autowired private MockMvc mockMvc;
	@MockitoBean private ImportDraftService service;

	@Test void list응답shape를반환한다() throws Exception {
		when(service.listDrafts(eq(OWNER_ID), eq("local"), eq(List.of("uploaded")), eq(20))).thenReturn(new ListImportDraftsResponse(List.of(
			new ImportDraftSnapshotResponse("draft-1", "local", "uploaded", new ImportDraftSourceFileResponse("local-draft:draft-1", "students.csv", 10, "2026-05-08T07:00:00Z", "text/csv", false, false, false, "csv"), null, null, null, "queued", 0, "대기", "2026-05-09T07:00:00Z", "2026-05-08T07:00:00Z")
		)));
		mockMvc.perform(get("/import-drafts").queryParam("provider", "local").queryParam("statuses", "uploaded").queryParam("limit", "20").header("X-Yeon-User-Id", OWNER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.drafts[0].id").value("draft-1"));
	}

	@Test void detail응답shape를반환한다() throws Exception {
		when(service.getDraft(eq(OWNER_ID), eq("draft-1"))).thenReturn(new ImportDraftSnapshotResponse("draft-1", "local", "uploaded", new ImportDraftSourceFileResponse("local-draft:draft-1", "students.csv", 10, "2026-05-08T07:00:00Z", "text/csv", false, false, false, "csv"), null, null, null, "queued", 0, "대기", "2026-05-09T07:00:00Z", "2026-05-08T07:00:00Z"));
		mockMvc.perform(get("/import-drafts/draft-1").header("X-Yeon-User-Id", OWNER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.provider").value("local"));
	}

	@Test void previewPatch응답shape를반환한다() throws Exception {
		when(service.patchPreview(eq(OWNER_ID), eq("draft-1"), eq(new PatchImportDraftPreviewRequest(List.of(), "edited")))).thenReturn(new OkResponse(true));
		mockMvc.perform(patch("/import-drafts/draft-1/preview").header("X-Yeon-User-Id", OWNER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token").contentType(MediaType.APPLICATION_JSON).content("{\"preview\":[],\"status\":\"edited\"}"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.ok").value(true));
	}

	@Test void delete응답shape를반환한다() throws Exception {
		when(service.deleteDraft(eq(OWNER_ID), eq("draft-1"))).thenReturn(new OkResponse(true));
		mockMvc.perform(delete("/import-drafts/draft-1").header("X-Yeon-User-Id", OWNER_ID.toString()).header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.ok").value(true));
	}
}
