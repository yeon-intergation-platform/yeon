package world.yeon.backend.sheet_export.export_run.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import world.yeon.backend.sheet_export.export_run.dto.RunSheetExportRequest;
import world.yeon.backend.sheet_export.read.dto.SheetExportFieldDefinitionResponse;
import world.yeon.backend.sheet_export.read.dto.SheetExportPayloadCoreResponse;
import world.yeon.backend.sheet_export.read.dto.SheetExportPayloadResponse;
import world.yeon.backend.sheet_export.read.dto.SheetExportRowResponse;
import world.yeon.backend.sheet_export.read.dto.SheetExportRowsResponse;
import world.yeon.backend.sheet_export.read.service.SheetExportReadService;
import world.yeon.backend.sheet_export.snapshot.repository.SheetExportSnapshotRepository;
import world.yeon.backend.sheet_export.snapshot.service.SheetExportSnapshotService;
import world.yeon.backend.sheet_export.sync.dto.FinalizeSheetExportSyncResponse;

@ExtendWith(MockitoExtension.class)
class SheetExportRunServiceTests {

	@Mock private SheetExportReadService readService;
	@Mock private SheetExportSnapshotRepository snapshotRepository;
	@Mock private SheetExportSnapshotService snapshotService;
	private TestableSheetExportRunService service;

	@BeforeEach
	void setUp() {
		service = new TestableSheetExportRunService(readService, snapshotRepository, snapshotService);
	}

	@Test
	void exportRun은googleWrite후syncFinalize를수행한다() {
		when(snapshotRepository.findIntegration("space_alpha", "sheet-1")).thenReturn(
			new SheetExportSnapshotRepository.IntegrationRow(10L, 11L, null)
		);
		when(readService.getRows("space_alpha")).thenReturn(new SheetExportRowsResponse(
			List.of(new SheetExportFieldDefinitionResponse("mfd_note", "메모", "text")),
			List.of(new SheetExportRowResponse(
				"mem_1",
				List.of("홍길동", "hong@example.com", "010", "수강중", "보통", "2026-05-01", "메모값"),
				new SheetExportPayloadResponse(new SheetExportPayloadCoreResponse("홍길동", "hong@example.com", "010", "active", "medium"), Map.of("메모", "메모값"))
			))
		));
		when(snapshotService.finalizeSync(eq("space_alpha"), any())).thenReturn(
			new FinalizeSheetExportSyncResponse(1, OffsetDateTime.parse("2026-05-08T06:00:00Z"))
		);

		var result = service.run("space_alpha", new RunSheetExportRequest("sheet-1", "token-1"));

		assertThat(result.exportedCount()).isEqualTo(1);
		assertThat(service.clearedSheetId).isEqualTo("sheet-1");
		assertThat(service.writtenValues.getFirst()).containsExactly("이름", "이메일", "전화번호", "수강 상태", "위험도", "등록일", "메모", "__yeon_member_id", "__yeon_exported_at");
		verify(snapshotService).finalizeSync(eq("space_alpha"), any());
	}

	@Test
	void integration이없으면404다() {
		when(snapshotRepository.findIntegration("space_alpha", "sheet-1")).thenReturn(null);
		assertThatThrownBy(() -> service.run("space_alpha", new RunSheetExportRequest("sheet-1", "token-1")))
			.isInstanceOf(java.util.NoSuchElementException.class)
			.hasMessage("연동된 익스포트 시트를 찾지 못했습니다.");
	}

	private static final class TestableSheetExportRunService extends SheetExportRunService {
		private String clearedSheetId;
		private List<List<String>> writtenValues;

		private TestableSheetExportRunService(
			SheetExportReadService readService,
			SheetExportSnapshotRepository snapshotRepository,
			SheetExportSnapshotService snapshotService
		) {
			super(readService, snapshotRepository, snapshotService);
		}

		@Override
		protected void clearSheet(String accessToken, String sheetId) {
			this.clearedSheetId = sheetId;
		}

		@Override
		protected void writeSheetValues(String accessToken, String sheetId, List<List<String>> values) {
			this.writtenValues = values;
		}
	}
}
