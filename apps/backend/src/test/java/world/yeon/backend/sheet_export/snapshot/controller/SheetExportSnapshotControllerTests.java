package world.yeon.backend.sheet_export.snapshot.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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
import world.yeon.backend.sheet_export.snapshot.dto.ReplaceSheetExportSnapshotsRequest;
import world.yeon.backend.sheet_export.snapshot.dto.ReplaceSheetExportSnapshotsResponse;
import world.yeon.backend.sheet_export.snapshot.dto.SheetExportSnapshotItemResponse;
import world.yeon.backend.sheet_export.snapshot.dto.SheetExportSnapshotsResponse;
import world.yeon.backend.sheet_export.snapshot.service.SheetExportSnapshotService;

@WebMvcTest(SheetExportSnapshotController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class SheetExportSnapshotControllerTests {

	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000793");

	@Autowired private MockMvc mockMvc;
	@MockitoBean private SheetExportSnapshotService service;

	@Test
	void snapshot조회응답shape를반환한다() throws Exception {
		when(service.getSnapshots(eq("space_alpha"), eq("sheet-1"))).thenReturn(
			new SheetExportSnapshotsResponse(
				OffsetDateTime.parse("2026-05-08T00:00:00Z"),
				List.of(new SheetExportSnapshotItemResponse(
					"mem_1",
					new SheetExportPayloadResponse(
						new SheetExportPayloadCoreResponse("홍길동", null, null, "active", null),
						Map.of("메모", "값")
					),
					"hash-1",
					OffsetDateTime.parse("2026-05-08T00:00:00Z")
				))
			)
		);

		mockMvc.perform(get("/spaces/space_alpha/sheet-export/snapshots")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.param("sheetId", "sheet-1")
			.accept(MediaType.APPLICATION_JSON))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.snapshots[0].memberId").value("mem_1"))
			.andExpect(jsonPath("$.snapshots[0].basePayload.customFields.메모").value("값"));
	}

	@Test
	void snapshot교체응답shape를반환한다() throws Exception {
		when(service.replaceSnapshots(eq("space_alpha"), eq(new ReplaceSheetExportSnapshotsRequest(
			"sheet-1",
			OffsetDateTime.parse("2026-05-08T00:00:00Z"),
			List.of()
		)))).thenReturn(new ReplaceSheetExportSnapshotsResponse(0));

		mockMvc.perform(put("/spaces/space_alpha/sheet-export/snapshots")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
				{"sheetId":"sheet-1","exportedAt":"2026-05-08T00:00:00Z","rows":[]}
			"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.replacedCount").value(0));
	}

	@Test
	void integration이없으면404다() throws Exception {
		doThrow(new java.util.NoSuchElementException("연동된 익스포트 시트를 찾지 못했습니다."))
			.when(service).getSnapshots(eq("space_alpha"), eq("sheet-1"));

		mockMvc.perform(get("/spaces/space_alpha/sheet-export/snapshots")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.param("sheetId", "sheet-1")
			.accept(MediaType.APPLICATION_JSON))
			.andExpect(status().isNotFound())
			.andExpect(jsonPath("$.code").value("SHEET_INTEGRATION_NOT_FOUND"));
	}
}
