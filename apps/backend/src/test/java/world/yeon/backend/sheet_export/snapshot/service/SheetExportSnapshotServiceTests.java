package world.yeon.backend.sheet_export.snapshot.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.NoSuchElementException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.fasterxml.jackson.databind.ObjectMapper;

import world.yeon.backend.sheet_export.read.dto.SheetExportPayloadCoreResponse;
import world.yeon.backend.sheet_export.read.dto.SheetExportPayloadResponse;
import world.yeon.backend.sheet_export.snapshot.dto.ReplaceSheetExportSnapshotRowRequest;
import world.yeon.backend.sheet_export.snapshot.dto.ReplaceSheetExportSnapshotsRequest;
import world.yeon.backend.sheet_export.snapshot.repository.SheetExportSnapshotRepository;
import world.yeon.backend.sheet_export.sync.dto.FinalizeSheetExportSyncRequest;

@ExtendWith(MockitoExtension.class)
class SheetExportSnapshotServiceTests {

	@Mock private SheetExportSnapshotRepository repository;
	private SheetExportSnapshotService service;
	private final ObjectMapper objectMapper = new ObjectMapper();

	@BeforeEach
	void setUp() {
		service = new SheetExportSnapshotService(repository);
	}

	@Test
	void snapshot응답을조합한다() throws Exception {
		when(repository.findIntegration("space_alpha", "sheet-1")).thenReturn(
			new SheetExportSnapshotRepository.IntegrationRow(10L, 1L, OffsetDateTime.parse("2026-05-08T00:00:00Z"))
		);
		when(repository.findSnapshots(10L)).thenReturn(List.of(
			new SheetExportSnapshotRepository.SnapshotRow(
				"mem_1",
				objectMapper.readTree("{\"core\":{\"name\":\"홍길동\",\"email\":null,\"phone\":null,\"status\":\"active\",\"initialRiskLevel\":null},\"customFields\":{\"메모\":\"값\"}}"),
				"hash-1",
				OffsetDateTime.parse("2026-05-08T00:00:00Z")
			)
		));

		var result = service.getSnapshots("space_alpha", "sheet-1");

		assertThat(result.lastSyncedAt()).isEqualTo(OffsetDateTime.parse("2026-05-08T00:00:00Z"));
		assertThat(result.snapshots()).hasSize(1);
		assertThat(result.snapshots().getFirst().memberId()).isEqualTo("mem_1");
		assertThat(result.snapshots().getFirst().basePayload().customFields()).containsEntry("메모", "값");
	}

	@Test
	void snapshot교체를위임한다() {
		when(repository.findIntegration("space_alpha", "sheet-1")).thenReturn(
			new SheetExportSnapshotRepository.IntegrationRow(10L, 1L, OffsetDateTime.parse("2026-05-08T00:00:00Z"))
		);

		var result = service.replaceSnapshots(
			"space_alpha",
			new ReplaceSheetExportSnapshotsRequest(
				"sheet-1",
				OffsetDateTime.parse("2026-05-08T01:00:00Z"),
				List.of(new ReplaceSheetExportSnapshotRowRequest(
					"mem_1",
					new SheetExportPayloadResponse(
						new SheetExportPayloadCoreResponse("홍길동", null, null, "active", null),
						java.util.Map.of("메모", "값")
					)
				))
			)
		);

		assertThat(result.replacedCount()).isEqualTo(1);
		verify(repository).replaceSnapshots(any(), any(), any(), any());
	}

	@Test
	void syncFinalize는snapshot교체와lastSynced갱신을함께수행한다() {
		when(repository.findIntegration("space_alpha", "sheet-1")).thenReturn(
			new SheetExportSnapshotRepository.IntegrationRow(10L, 1L, OffsetDateTime.parse("2026-05-08T00:00:00Z"))
		);

		var result = service.finalizeSync(
			"space_alpha",
			new FinalizeSheetExportSyncRequest(
				"sheet-1",
				OffsetDateTime.parse("2026-05-08T01:00:00Z"),
				List.of(new ReplaceSheetExportSnapshotRowRequest(
					"mem_1",
					new SheetExportPayloadResponse(
						new SheetExportPayloadCoreResponse("홍길동", null, null, "active", null),
						java.util.Map.of("메모", "값")
					)
				))
			)
		);

		assertThat(result.exportedCount()).isEqualTo(1);
		assertThat(result.lastSyncedAt()).isEqualTo(OffsetDateTime.parse("2026-05-08T01:00:00Z"));
		verify(repository).replaceSnapshots(any(), any(), any(), any());
		verify(repository).updateIntegrationLastSyncedAt(eq(10L), eq(OffsetDateTime.parse("2026-05-08T01:00:00Z")));
	}

	@Test
	void integration이없으면404다() {
		when(repository.findIntegration("space_alpha", "sheet-1")).thenReturn(null);

		assertThatThrownBy(() -> service.getSnapshots("space_alpha", "sheet-1"))
			.isInstanceOf(NoSuchElementException.class)
			.hasMessage("연동된 익스포트 시트를 찾지 못했습니다.");
	}
}
