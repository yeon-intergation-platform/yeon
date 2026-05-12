package world.yeon.backend.sheet_export.import_run.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
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

import world.yeon.backend.sheet_export.import_evaluation.dto.SheetExportImportSummaryResponse;
import world.yeon.backend.sheet_export.import_run.dto.RunSheetImportRequest;
import world.yeon.backend.sheet_export.import_run.dto.RunSheetImportResponse;
import world.yeon.backend.sheet_export.import_run.service.SheetExportImportRunService;
import world.yeon.backend.sheet_export.import_run.service.SheetExportImportRunServiceException;

@WebMvcTest(SheetExportImportRunController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class SheetExportImportRunControllerTests {

	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000804");

	@Autowired private MockMvc mockMvc;
	@MockitoBean private SheetExportImportRunService service;

	@Test
	void importRun응답shape를반환한다() throws Exception {
		when(service.run(eq("space_alpha"), eq(OWNER_ID), eq(new RunSheetImportRequest("sheet-1", "token-1"))))
			.thenReturn(new RunSheetImportResponse("blocked", new SheetExportImportSummaryResponse(0, 0, 0, 0, 1), List.of(), OffsetDateTime.parse("2026-05-08T06:40:00Z")));

		mockMvc.perform(post("/spaces/space_alpha/sheet-export/import-run")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
				{"sheetId":"sheet-1","accessToken":"token-1"}
			"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.status").value("blocked"));
	}

	@Test
	void googleError는502다() throws Exception {
		when(service.run(eq("space_alpha"), eq(OWNER_ID), eq(new RunSheetImportRequest("sheet-1", "token-1"))))
			.thenThrow(new SheetExportImportRunServiceException(502, "GOOGLE_SHEETS_API_ERROR", "구글 시트 읽기에 실패했습니다."));

		mockMvc.perform(post("/spaces/space_alpha/sheet-export/import-run")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
				{"sheetId":"sheet-1","accessToken":"token-1"}
			"""))
			.andExpect(status().isBadGateway())
			.andExpect(jsonPath("$.code").value("GOOGLE_SHEETS_API_ERROR"));
	}
}
