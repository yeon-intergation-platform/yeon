package world.yeon.backend.sheet_export.import_context.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import world.yeon.backend.sheet_export.import_context.dto.SheetExportImportContextFieldDefinitionResponse;
import world.yeon.backend.sheet_export.import_context.dto.SheetExportImportContextMemberResponse;
import world.yeon.backend.sheet_export.import_context.dto.SheetExportImportContextResponse;
import world.yeon.backend.sheet_export.import_context.service.SheetExportImportContextService;
import world.yeon.backend.sheet_export.read.dto.SheetExportPayloadCoreResponse;
import world.yeon.backend.sheet_export.read.dto.SheetExportPayloadResponse;
import world.yeon.backend.sheet_export.snapshot.dto.SheetExportSnapshotItemResponse;

@WebMvcTest(SheetExportImportContextController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class SheetExportImportContextControllerTests {

	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000795");
	@Autowired private MockMvc mockMvc;
	@MockitoBean private SheetExportImportContextService service;

	@Test
	void importContext응답shape를반환한다() throws Exception {
		when(service.getContext(eq("space_alpha"), eq("sheet-1"))).thenReturn(
			new SheetExportImportContextResponse(
				OffsetDateTime.parse("2026-05-08T00:00:00Z"),
				List.of(new SheetExportImportContextFieldDefinitionResponse("mfd_status", "상태", "select")),
				List.of(new SheetExportImportContextMemberResponse(
					"mem_1", "홍길동", null, null, "active", null,
					new SheetExportPayloadResponse(new SheetExportPayloadCoreResponse("홍길동", null, null, "active", null), Map.of("상태", "in_progress"))
				)),
				List.of(new SheetExportSnapshotItemResponse(
					"mem_1",
					new SheetExportPayloadResponse(new SheetExportPayloadCoreResponse("홍길동", null, null, "active", null), Map.of("상태", "in_progress")),
					"hash-1",
					OffsetDateTime.parse("2026-05-08T00:00:00Z")
				))
			)
		);

		mockMvc.perform(get("/spaces/space_alpha/sheet-export/import-context")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.param("sheetId", "sheet-1")
			.accept(MediaType.APPLICATION_JSON))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.fieldDefinitions[0].id").value("mfd_status"))
			.andExpect(jsonPath("$.members[0].payload.customFields.상태").value("in_progress"))
			.andExpect(jsonPath("$.snapshots[0].basePayload.customFields.상태").value("in_progress"));
	}
}
