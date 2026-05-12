package world.yeon.backend.sheet_export.sync.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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

import world.yeon.backend.sheet_export.read.dto.SheetExportPayloadCoreResponse;
import world.yeon.backend.sheet_export.read.dto.SheetExportPayloadResponse;
import world.yeon.backend.sheet_export.snapshot.dto.ReplaceSheetExportSnapshotRowRequest;
import world.yeon.backend.sheet_export.snapshot.service.SheetExportSnapshotService;
import world.yeon.backend.sheet_export.sync.dto.FinalizeSheetExportSyncRequest;
import world.yeon.backend.sheet_export.sync.dto.FinalizeSheetExportSyncResponse;

@WebMvcTest(SheetExportSyncController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class SheetExportSyncControllerTests {

	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000801");

	@Autowired private MockMvc mockMvc;
	@MockitoBean private SheetExportSnapshotService service;

	@Test
	void syncFinalize응답shape를반환한다() throws Exception {
		when(service.finalizeSync(eq("space_alpha"), eq(new FinalizeSheetExportSyncRequest(
			"sheet-1",
			OffsetDateTime.parse("2026-05-08T05:40:00Z"),
			List.of(new ReplaceSheetExportSnapshotRowRequest(
				"mem_1",
				new SheetExportPayloadResponse(
					new SheetExportPayloadCoreResponse("홍길동", null, null, "active", null),
					Map.of("메모", "값")
				)
			))
		)))).thenReturn(new FinalizeSheetExportSyncResponse(1, OffsetDateTime.parse("2026-05-08T05:40:00Z")));

		mockMvc.perform(post("/spaces/space_alpha/sheet-export/sync")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
				{"sheetId":"sheet-1","exportedAt":"2026-05-08T05:40:00Z","rows":[{"memberId":"mem_1","payload":{"core":{"name":"홍길동","email":null,"phone":null,"status":"active","initialRiskLevel":null},"customFields":{"메모":"값"}}}]}
			"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.exportedCount").value(1))
			.andExpect(jsonPath("$.lastSyncedAt").value("2026-05-08T05:40:00Z"));
	}

	@Test
	void integration이없으면404다() throws Exception {
		doThrow(new java.util.NoSuchElementException("연동된 익스포트 시트를 찾지 못했습니다."))
			.when(service).finalizeSync(eq("space_alpha"), eq(new FinalizeSheetExportSyncRequest(
				"sheet-1",
				OffsetDateTime.parse("2026-05-08T05:40:00Z"),
				List.of()
			)));

		mockMvc.perform(post("/spaces/space_alpha/sheet-export/sync")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
				{"sheetId":"sheet-1","exportedAt":"2026-05-08T05:40:00Z","rows":[]}
			"""))
			.andExpect(status().isNotFound())
			.andExpect(jsonPath("$.code").value("SHEET_INTEGRATION_NOT_FOUND"));
	}
}
