package world.yeon.backend.sheet_export.integration.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import world.yeon.backend.sheet_export.integration.dto.DeleteSheetExportIntegrationResponse;
import world.yeon.backend.sheet_export.integration.dto.GetSheetExportIntegrationResponse;
import world.yeon.backend.sheet_export.integration.dto.SheetExportIntegrationResponse;
import world.yeon.backend.sheet_export.integration.dto.UpsertSheetExportIntegrationRequest;
import world.yeon.backend.sheet_export.integration.dto.UpsertSheetExportIntegrationResponse;
import world.yeon.backend.sheet_export.integration.service.SheetExportIntegrationService;

@WebMvcTest(SheetExportIntegrationController.class)
@ActiveProfiles("jdbc")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class SheetExportIntegrationControllerTests {

	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000806");

	@Autowired private MockMvc mockMvc;
	@MockitoBean private SheetExportIntegrationService service;

	@Test
	void get응답shape를반환한다() throws Exception {
		when(service.getIntegration(eq("space_alpha"))).thenReturn(new GetSheetExportIntegrationResponse(
			new SheetExportIntegrationResponse("sgi_1", "https://docs.google.com/spreadsheets/d/sheet-1/edit", "sheet-1", "export", null, null, OffsetDateTime.parse("2026-05-08T07:00:00Z"), OffsetDateTime.parse("2026-05-08T07:00:00Z"))
		));

		mockMvc.perform(get("/spaces/space_alpha/sheet-export/integration")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.integration.sheetId").value("sheet-1"));
	}

	@Test
	void put응답shape를반환한다() throws Exception {
		when(service.upsertIntegration(eq("space_alpha"), eq(OWNER_ID), eq(new UpsertSheetExportIntegrationRequest("https://docs.google.com/spreadsheets/d/sheet-1/edit"))))
			.thenReturn(new UpsertSheetExportIntegrationResponse(
				new SheetExportIntegrationResponse("sgi_1", "https://docs.google.com/spreadsheets/d/sheet-1/edit", "sheet-1", "export", null, null, OffsetDateTime.parse("2026-05-08T07:00:00Z"), OffsetDateTime.parse("2026-05-08T07:00:00Z"))
			));

		mockMvc.perform(put("/spaces/space_alpha/sheet-export/integration")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.contentType(MediaType.APPLICATION_JSON)
			.content("{\"sheetUrl\":\"https://docs.google.com/spreadsheets/d/sheet-1/edit\"}"))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.integration.sheetId").value("sheet-1"));
	}

	@Test
	void delete응답shape를반환한다() throws Exception {
		when(service.deleteIntegration(eq("space_alpha"), eq(OWNER_ID))).thenReturn(new DeleteSheetExportIntegrationResponse(true));

		mockMvc.perform(delete("/spaces/space_alpha/sheet-export/integration")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.ok").value(true));
	}
}
