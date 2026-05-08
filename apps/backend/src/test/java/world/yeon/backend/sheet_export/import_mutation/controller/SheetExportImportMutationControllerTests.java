package world.yeon.backend.sheet_export.import_mutation.controller;

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

import world.yeon.backend.sheet_export.import_mutation.dto.SheetExportImportMutationRequest;
import world.yeon.backend.sheet_export.import_mutation.dto.SheetExportImportMutationResponse;
import world.yeon.backend.sheet_export.import_mutation.service.SheetExportImportMutationService;
import world.yeon.backend.sheet_export.import_mutation.service.SheetExportImportMutationServiceException;

@WebMvcTest(SheetExportImportMutationController.class)
@ActiveProfiles("jdbc")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class SheetExportImportMutationControllerTests {

	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000799");

	@Autowired private MockMvc mockMvc;
	@MockitoBean private SheetExportImportMutationService service;

	@Test
	void mutation응답shape를반환한다() throws Exception {
		when(service.apply(eq("space_alpha"), eq(OWNER_ID), eq(new SheetExportImportMutationRequest("sheet-1", List.of(), List.of()))))
			.thenReturn(new SheetExportImportMutationResponse(1, 2));

		mockMvc.perform(post("/spaces/space_alpha/sheet-export/import-mutation")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
			{"sheetId":"sheet-1","plannedCreates":[],"plannedUpdates":[]}
			"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.createdCount").value(1))
			.andExpect(jsonPath("$.updatedCount").value(2));
	}

	@Test
	void linkedExport가없으면404다() throws Exception {
		when(service.apply(eq("space_alpha"), eq(OWNER_ID), eq(new SheetExportImportMutationRequest("sheet-1", List.of(), List.of()))))
			.thenThrow(new SheetExportImportMutationServiceException(404, "연동된 익스포트 시트를 찾지 못했습니다.", "SHEET_INTEGRATION_NOT_FOUND"));

		mockMvc.perform(post("/spaces/space_alpha/sheet-export/import-mutation")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
			{"sheetId":"sheet-1","plannedCreates":[],"plannedUpdates":[]}
			"""))
			.andExpect(status().isNotFound())
			.andExpect(jsonPath("$.code").value("SHEET_INTEGRATION_NOT_FOUND"));
	}
}
