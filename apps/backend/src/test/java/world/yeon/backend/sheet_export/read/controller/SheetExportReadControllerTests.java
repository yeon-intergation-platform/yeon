package world.yeon.backend.sheet_export.read.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.NoSuchElementException;
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

import world.yeon.backend.sheet_export.read.dto.SheetExportFieldDefinitionResponse;
import world.yeon.backend.sheet_export.read.dto.SheetExportPayloadCoreResponse;
import world.yeon.backend.sheet_export.read.dto.SheetExportPayloadResponse;
import world.yeon.backend.sheet_export.read.dto.SheetExportRowResponse;
import world.yeon.backend.sheet_export.read.dto.SheetExportRowsResponse;
import world.yeon.backend.sheet_export.read.service.SheetExportReadService;

@WebMvcTest(SheetExportReadController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class SheetExportReadControllerTests {

	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000792");

	@Autowired private MockMvc mockMvc;
	@MockitoBean private SheetExportReadService service;

	@Test
	void rows조회는응답shape를반환한다() throws Exception {
		when(service.getRows(eq("space_alpha"))).thenReturn(new SheetExportRowsResponse(
			List.of(new SheetExportFieldDefinitionResponse("mfd_status", "상태", "select")),
			List.of(new SheetExportRowResponse(
				"mem_1",
				List.of("홍길동", "", "", "수강중", "", "2026-05-01", "in_progress"),
				new SheetExportPayloadResponse(
					new SheetExportPayloadCoreResponse("홍길동", null, null, "active", null),
					Map.of("상태", "in_progress")
				)
			))
		));

		mockMvc.perform(get("/spaces/space_alpha/sheet-export/rows")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.accept(MediaType.APPLICATION_JSON))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.fieldDefinitions[0].id").value("mfd_status"))
			.andExpect(jsonPath("$.rows[0].memberId").value("mem_1"))
			.andExpect(jsonPath("$.rows[0].payload.customFields.상태").value("in_progress"));
	}

	@Test
	void space가없으면404다() throws Exception {
		when(service.getRows(eq("missing"))).thenThrow(new NoSuchElementException("스페이스를 찾지 못했습니다."));

		mockMvc.perform(get("/spaces/missing/sheet-export/rows")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.accept(MediaType.APPLICATION_JSON))
			.andExpect(status().isNotFound())
			.andExpect(jsonPath("$.code").value("SPACE_NOT_FOUND"));
	}
}
