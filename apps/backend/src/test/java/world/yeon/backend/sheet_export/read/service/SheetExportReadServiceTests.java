package world.yeon.backend.sheet_export.read.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
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

import world.yeon.backend.sheet_export.read.dto.SheetExportRowsResponse;
import world.yeon.backend.sheet_export.read.repository.SheetExportReadRepository;

@ExtendWith(MockitoExtension.class)
class SheetExportReadServiceTests {

	@Mock private SheetExportReadRepository repository;
	private SheetExportReadService service;
	private final ObjectMapper objectMapper = new ObjectMapper();

	@BeforeEach
	void setUp() { service = new SheetExportReadService(repository); }

	@Test
	void exportRows응답을조합한다() throws Exception {
		when(repository.findSpaceInternalId("space_alpha")).thenReturn(11L);
		when(repository.findMembers(11L)).thenReturn(List.of(
			new SheetExportReadRepository.MemberRow(21L, "mem_1", "홍길동", "hong@example.com", "010", "active", "medium", OffsetDateTime.parse("2026-05-01T00:00:00+09:00"))
		));
		when(repository.findFieldDefinitions(11L)).thenReturn(List.of(
			new SheetExportReadRepository.FieldDefinitionRow(31L, "mfd_status", "상태", "select"),
			new SheetExportReadRepository.FieldDefinitionRow(32L, "mfd_note", "메모", "text")
		));
		when(repository.findValues(List.of(21L), List.of(31L, 32L))).thenReturn(List.of(
			new SheetExportReadRepository.ValueRow(21L, 31L, null, null, null, objectMapper.readTree("[\"in_progress\"]")),
			new SheetExportReadRepository.ValueRow(21L, 32L, "메모값", null, null, null)
		));

		SheetExportRowsResponse result = service.getRows("space_alpha");
		assertThat(result.fieldDefinitions()).hasSize(2);
		assertThat(result.rows()).hasSize(1);
		assertThat(result.rows().getFirst().values()).containsExactly("홍길동", "hong@example.com", "010", "수강중", "보통", "2026-05-01", "in_progress", "메모값");
		assertThat(result.rows().getFirst().payload().customFields()).containsEntry("상태", "in_progress");
	}

	@Test
	void space가없으면404다() {
		when(repository.findSpaceInternalId("missing")).thenReturn(null);
		assertThatThrownBy(() -> service.getRows("missing"))
			.isInstanceOf(NoSuchElementException.class)
			.hasMessage("스페이스를 찾지 못했습니다.");
	}
}
