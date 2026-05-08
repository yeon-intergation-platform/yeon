package world.yeon.backend.sheet_export.import_context.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.NoSuchElementException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.fasterxml.jackson.databind.ObjectMapper;

import world.yeon.backend.sheet_export.import_context.repository.SheetExportImportContextRepository;

@ExtendWith(MockitoExtension.class)
class SheetExportImportContextServiceTests {

	@Mock private SheetExportImportContextRepository repository;
	private SheetExportImportContextService service;
	private final ObjectMapper objectMapper = new ObjectMapper();

	@BeforeEach
	void setUp() { service = new SheetExportImportContextService(repository); }

	@Test
	void importContext응답을조합한다() throws Exception {
		when(repository.findIntegration("space_alpha", "sheet-1")).thenReturn(new SheetExportImportContextRepository.IntegrationRow(10L, 1L, java.time.OffsetDateTime.parse("2026-05-08T00:00:00Z")));
		when(repository.findMembers(1L)).thenReturn(List.of(
			new SheetExportImportContextRepository.MemberRow(21L, "mem_1", "홍길동", null, null, "active", null)
		));
		when(repository.findFieldDefinitions(1L)).thenReturn(List.of(
			new SheetExportImportContextRepository.FieldDefinitionRow(31L, "mfd_status", "상태", "select")
		));
		when(repository.findValues(List.of(21L), List.of(31L))).thenReturn(List.of(
			new SheetExportImportContextRepository.ValueRow(21L, 31L, null, null, null, objectMapper.readTree("[\"in_progress\"]"))
		));
		when(repository.findSnapshots(10L)).thenReturn(List.of(
			new SheetExportImportContextRepository.SnapshotRow("mem_1", objectMapper.readTree("{\"core\":{\"name\":\"홍길동\",\"email\":null,\"phone\":null,\"status\":\"active\",\"initialRiskLevel\":null},\"customFields\":{\"상태\":\"in_progress\"}}"), "hash-1", java.time.OffsetDateTime.parse("2026-05-08T00:00:00Z"))
		));

		var result = service.getContext("space_alpha", "sheet-1");
		assertThat(result.fieldDefinitions()).hasSize(1);
		assertThat(result.members()).hasSize(1);
		assertThat(result.members().getFirst().payload().customFields()).containsEntry("상태", "in_progress");
		assertThat(result.snapshots()).hasSize(1);
	}

	@Test
	void integration이없으면404다() {
		when(repository.findIntegration("space_alpha", "sheet-1")).thenReturn(null);
		assertThatThrownBy(() -> service.getContext("space_alpha", "sheet-1"))
			.isInstanceOf(NoSuchElementException.class)
			.hasMessage("연동된 익스포트 시트를 찾지 못했습니다.");
	}
}
