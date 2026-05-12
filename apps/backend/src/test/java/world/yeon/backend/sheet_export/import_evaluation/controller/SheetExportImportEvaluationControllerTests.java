package world.yeon.backend.sheet_export.import_evaluation.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.OffsetDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import world.yeon.backend.sheet_export.import_evaluation.dto.SheetExportImportEvaluationRequest;
import world.yeon.backend.sheet_export.import_evaluation.dto.SheetExportImportEvaluationResponse;
import world.yeon.backend.sheet_export.import_evaluation.dto.SheetExportImportSummaryResponse;
import world.yeon.backend.sheet_export.import_evaluation.service.SheetExportImportEvaluationService;

@WebMvcTest(SheetExportImportEvaluationController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class SheetExportImportEvaluationControllerTests {
	@Autowired private MockMvc mockMvc;
	@MockitoBean private SheetExportImportEvaluationService service;

	@Test
	void evaluation응답shape를반환한다() throws Exception {
		when(service.evaluate(eq("space_alpha"), eq(new SheetExportImportEvaluationRequest("sheet-1", List.of(List.of("이름")))))).thenReturn(
			new SheetExportImportEvaluationResponse("blocked", new SheetExportImportSummaryResponse(0,0,0,0,1), List.of(), OffsetDateTime.parse("2026-05-08T00:00:00Z"), List.of(), List.of())
		);
		mockMvc.perform(post("/spaces/space_alpha/sheet-export/import-evaluation")
			.header("X-Yeon-User-Id", "00000000-0000-0000-0000-000000000797")
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
			{"sheetId":"sheet-1","rows":[["이름"]]}
			"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.status").value("blocked"))
			.andExpect(jsonPath("$.summary.conflicts").value(1));
	}
}
