package world.yeon.backend.sheet_export.import_run.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import world.yeon.backend.googledrive_browser.service.GoogleDriveBrowserService;
import world.yeon.backend.sheet_export.export_run.dto.RunSheetExportResponse;
import world.yeon.backend.sheet_export.export_run.service.SheetExportRunService;
import world.yeon.backend.sheet_export.import_evaluation.dto.SheetExportImportConflictResponse;
import world.yeon.backend.sheet_export.import_evaluation.dto.SheetExportImportEvaluationResponse;
import world.yeon.backend.sheet_export.import_evaluation.dto.SheetExportImportPlannedMutationResponse;
import world.yeon.backend.sheet_export.import_evaluation.dto.SheetExportImportPlannedValueResponse;
import world.yeon.backend.sheet_export.import_evaluation.dto.SheetExportImportSummaryResponse;
import world.yeon.backend.sheet_export.import_evaluation.service.SheetExportImportEvaluationService;
import world.yeon.backend.sheet_export.import_mutation.service.SheetExportImportMutationService;
import world.yeon.backend.sheet_export.import_run.dto.RunSheetImportRequest;
import world.yeon.backend.sheet_export.read.dto.SheetExportPayloadCoreResponse;
import world.yeon.backend.sheet_export.read.dto.SheetExportPayloadResponse;

@ExtendWith(MockitoExtension.class)
class SheetExportImportRunServiceTests {

	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000803");

	@Mock private SheetExportImportEvaluationService evaluationService;
	@Mock private SheetExportImportMutationService mutationService;
	@Mock private SheetExportRunService exportRunService;
	@Mock private GoogleDriveBrowserService googleDriveBrowserService;
	private TestableSheetExportImportRunService service;

	@BeforeEach
	void setUp() {
		service = new TestableSheetExportImportRunService(evaluationService, mutationService, exportRunService, googleDriveBrowserService);
	}

	@Test
	void blocked면mutation과reexport없이반환한다() {
		when(googleDriveBrowserService.getValidAccessToken(OWNER_ID)).thenReturn("token-from-spring");
		when(evaluationService.evaluate(eq("space_alpha"), any())).thenReturn(new SheetExportImportEvaluationResponse(
			"blocked",
			new SheetExportImportSummaryResponse(0, 0, 0, 0, 1),
			List.of(new SheetExportImportConflictResponse("metadata_missing", null, null, null, List.of(), "msg", null, null, null)),
			OffsetDateTime.parse("2026-05-08T06:40:00Z"),
			List.of(),
			List.of()
		));

		var result = service.run("space_alpha", OWNER_ID, new RunSheetImportRequest("sheet-1", "token-1"));
		assertThat(result.status()).isEqualTo("blocked");
		verify(mutationService, never()).apply(any(), any(), any());
		verify(exportRunService, never()).run(any(), any(), any());
	}

	@Test
	void applied면mutation후reexport한다() {
		when(googleDriveBrowserService.getValidAccessToken(OWNER_ID)).thenReturn("token-from-spring");
		when(evaluationService.evaluate(eq("space_alpha"), any())).thenReturn(new SheetExportImportEvaluationResponse(
			"applied",
			new SheetExportImportSummaryResponse(1, 1, 0, 0, 0),
			List.of(),
			OffsetDateTime.parse("2026-05-08T06:40:00Z"),
			List.of(new SheetExportImportPlannedMutationResponse(
				null,
				new SheetExportPayloadResponse(new SheetExportPayloadCoreResponse("새 학생", null, null, "active", null), Map.of("메모", "값")),
				List.of(new SheetExportImportPlannedValueResponse("mfd_note", "값"))
			)),
			List.of()
		));
		when(exportRunService.run(eq("space_alpha"), eq(OWNER_ID), any())).thenReturn(new RunSheetExportResponse(2, OffsetDateTime.parse("2026-05-08T06:41:00Z")));

		var result = service.run("space_alpha", OWNER_ID, new RunSheetImportRequest("sheet-1", "token-1"));
		assertThat(result.status()).isEqualTo("applied");
		assertThat(result.lastSyncedAt()).isEqualTo(OffsetDateTime.parse("2026-05-08T06:41:00Z"));
		verify(mutationService).apply(eq("space_alpha"), eq(OWNER_ID), any());
		verify(exportRunService).run(eq("space_alpha"), eq(OWNER_ID), any());
	}

	private static final class TestableSheetExportImportRunService extends SheetExportImportRunService {
		private TestableSheetExportImportRunService(
			SheetExportImportEvaluationService evaluationService,
			SheetExportImportMutationService mutationService,
			SheetExportRunService exportRunService,
			GoogleDriveBrowserService googleDriveBrowserService
		) {
			super(evaluationService, mutationService, exportRunService, googleDriveBrowserService);
		}

		@Override
		protected List<List<String>> readSheetValues(String accessToken, String sheetId) {
			return List.of(List.of("이름", "__yeon_member_id"), List.of("홍길동", "mem_1"));
		}
	}
}
