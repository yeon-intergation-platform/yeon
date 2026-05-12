package world.yeon.backend.sheet_integrations.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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

import world.yeon.backend.sheet_integrations.dto.CreateSheetIntegrationRequest;
import world.yeon.backend.sheet_integrations.dto.CreateSheetIntegrationResponse;
import world.yeon.backend.sheet_integrations.dto.GetSheetIntegrationsResponse;
import world.yeon.backend.sheet_integrations.dto.SheetIntegrationColumnMappingDto;
import world.yeon.backend.sheet_integrations.dto.SheetIntegrationResponse;
import world.yeon.backend.sheet_integrations.dto.SyncSheetIntegrationResponse;
import world.yeon.backend.sheet_integrations.service.SheetIntegrationService;

@WebMvcTest(SheetIntegrationController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class SheetIntegrationControllerTests {

	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000901");
	private static final String REQUEST_BODY = """
		{"sheetUrl":"https://docs.google.com/spreadsheets/d/sheet-1/edit","dataType":"attendance","columnMapping":{"nameColumn":0,"dateColumn":1,"statusColumn":2,"typeColumn":3}}
		""".strip();

	@Autowired private MockMvc mockMvc;
	@MockitoBean private SheetIntegrationService service;

	@Test
	void get응답shape를반환한다() throws Exception {
		when(service.getIntegrations(eq("space_alpha"))).thenReturn(new GetSheetIntegrationsResponse(List.of(
			new SheetIntegrationResponse("sht_1", "https://docs.google.com/spreadsheets/d/sheet-1/edit", "sheet-1", "attendance", new SheetIntegrationColumnMappingDto(0, 1, 2, 3), null, OffsetDateTime.parse("2026-05-08T07:00:00Z"), OffsetDateTime.parse("2026-05-08T07:00:00Z"))
		)));

		mockMvc.perform(get("/spaces/space_alpha/sheet-integrations")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.integrations[0].sheetId").value("sheet-1"));
	}

	@Test
	void post응답shape를반환한다() throws Exception {
		var request = new CreateSheetIntegrationRequest(
			"https://docs.google.com/spreadsheets/d/sheet-1/edit",
			"attendance",
			new SheetIntegrationColumnMappingDto(0, 1, 2, 3)
		);
		when(service.createIntegration(eq("space_alpha"), eq(OWNER_ID), eq(request)))
			.thenReturn(new CreateSheetIntegrationResponse(
				new SheetIntegrationResponse("sht_1", "https://docs.google.com/spreadsheets/d/sheet-1/edit", "sheet-1", "attendance", new SheetIntegrationColumnMappingDto(0, 1, 2, 3), null, OffsetDateTime.parse("2026-05-08T07:00:00Z"), OffsetDateTime.parse("2026-05-08T07:00:00Z"))
			));

		mockMvc.perform(post("/spaces/space_alpha/sheet-integrations")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.contentType(MediaType.APPLICATION_JSON)
			.content(REQUEST_BODY))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.integration.publicId").value("sht_1"));
	}

	@Test
	void sync응답shape를반환한다() throws Exception {
		when(service.syncIntegration(eq("space_alpha"), eq("sht_1"), eq(OWNER_ID))).thenReturn(new SyncSheetIntegrationResponse(3, 1));

		mockMvc.perform(post("/spaces/space_alpha/sheet-integrations/sht_1/sync")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.synced").value(3))
			.andExpect(jsonPath("$.errors").value(1));
	}
}
