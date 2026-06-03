package world.yeon.backend.import_commit.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import world.yeon.backend.import_commit.dto.*;
import world.yeon.backend.import_commit.repository.ImportCommitRepository;

@ExtendWith(MockitoExtension.class)
class ImportCommitServiceTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000962");
	@Mock private ImportCommitRepository repository;
	private ImportCommitService service;

	@BeforeEach void setUp() { service = new ImportCommitService(repository); }

	@Test void 빈스페이스이름은400이다() {
		assertThatThrownBy(() -> service.commitImport(OWNER_ID, new ImportCommitRequest(null, new ImportPreviewRequest(List.of(new ImportCohortRequest("   ", null, null, List.of(new ImportStudentRequest("홍길동", null, null, null, null))))))))
			.isInstanceOf(ImportCommitServiceException.class)
			.hasMessage("스페이스 이름은 필수입니다.");
	}

	@Test void 빈수강생이름은400이다() {
		assertThatThrownBy(() -> service.commitImport(OWNER_ID, new ImportCommitRequest(null, new ImportPreviewRequest(List.of(new ImportCohortRequest("1기", null, null, List.of(new ImportStudentRequest("   ", null, null, null, null))))))))
			.isInstanceOf(ImportCommitServiceException.class)
			.hasMessage("수강생 이름은 필수입니다.");
	}

	@Test void draftId가있으면상태전이와집계를반환한다() {
		when(repository.findOwnedDraft(OWNER_ID, "draft-1")).thenReturn(new ImportCommitRepository.OwnedDraftRow("draft-1"));
		when(repository.insertSpace(any(), eq("1기"), eq(null), eq(null), eq(OWNER_ID), any())).thenReturn(new ImportCommitRepository.CreatedSpaceRow(1L, "space-1"));
		when(repository.insertDefaultTabs(eq(1L), eq(OWNER_ID), any(), any())).thenReturn(List.of(new ImportCommitRepository.InsertedTabRow(11L, "overview")));
		when(repository.insertCustomFields(eq(1L), eq(11L), eq(OWNER_ID), any(), any())).thenAnswer(inv -> {
			java.util.List<Object[]> fields = inv.getArgument(4);
			return fields.stream().map(f -> new ImportCommitRepository.InsertedFieldRow(201L, (String) f[1], (String) f[2])).toList();
		});
		when(repository.insertMembers(eq(1L), any(), any())).thenAnswer(inv -> {
			java.util.List<Object[]> rows = inv.getArgument(2);
			return rows.stream().map(r -> new ImportCommitRepository.InsertedMemberRow(101L, (String) r[0])).toList();
		});
		var result = service.commitImport(OWNER_ID, new ImportCommitRequest("draft-1", new ImportPreviewRequest(List.of(new ImportCohortRequest("1기", null, null, List.of(new ImportStudentRequest("홍길동", null, null, null, Map.of("메모", "값"))))))));
		assertThat(result.created().spaces()).isEqualTo(1);
		assertThat(result.created().members()).isEqualTo(1);
		assertThat(result.spaceIds()).containsExactly("space-1");
	}

	@Test void draftId가없으면draft상태전이는건너뛴다() {
		when(repository.insertSpace(any(), eq("1기"), eq(null), eq(null), eq(OWNER_ID), any())).thenReturn(new ImportCommitRepository.CreatedSpaceRow(1L, "space-1"));
		when(repository.insertDefaultTabs(eq(1L), eq(OWNER_ID), any(), any())).thenReturn(List.of(new ImportCommitRepository.InsertedTabRow(11L, "overview")));
		when(repository.insertMembers(eq(1L), any(), any())).thenAnswer(inv -> {
			java.util.List<Object[]> rows = inv.getArgument(2);
			return rows.stream().map(r -> new ImportCommitRepository.InsertedMemberRow(101L, (String) r[0])).toList();
		});
		service.commitImport(OWNER_ID, new ImportCommitRequest(null, new ImportPreviewRequest(List.of(new ImportCohortRequest("1기", null, null, List.of(new ImportStudentRequest("홍길동", null, null, null, null)))))));
		verify(repository, never()).markDraftImporting(any(), any());
	}
}
