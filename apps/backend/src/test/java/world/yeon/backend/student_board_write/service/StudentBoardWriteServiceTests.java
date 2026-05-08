package world.yeon.backend.student_board_write.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import world.yeon.backend.student_board_read.dto.StudentBoardReadResponse;
import world.yeon.backend.student_board_read.service.StudentBoardReadService;
import world.yeon.backend.student_board_write.dto.UpdateStudentBoardRequest;
import world.yeon.backend.student_board_write.repository.StudentBoardWriteRepository;

@ExtendWith(MockitoExtension.class)
class StudentBoardWriteServiceTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000961");
	@Mock private StudentBoardWriteRepository repository;
	@Mock private StudentBoardReadService readService;
	private StudentBoardWriteService service;

	@BeforeEach void setUp() {
		service = new StudentBoardWriteService(repository, readService);
	}

	@Test void 변경이있으면업데이트후board를반환한다() {
		when(repository.findOwnedMemberContext("space_alpha", "mem_1", OWNER_ID)).thenReturn(new StudentBoardWriteRepository.OwnedMemberContextRow(11L, 21L));
		when(repository.findBoardSnapshot(11L, 21L)).thenReturn(new StudentBoardWriteRepository.BoardSnapshotRow(
			"unknown", null, null, "unknown", null, null, null, null, null
		));
		when(readService.getBoard("space_alpha", OWNER_ID, "7d")).thenReturn(new StudentBoardReadResponse(List.of(), List.of(), "7d"));

		var request = new UpdateStudentBoardRequest();
		request.setAttendanceStatus("present");
		request.setAssignmentStatus("done");
		request.setAssignmentLink(null);
		var result = service.updateBoard("space_alpha", "mem_1", OWNER_ID, request);
		assertThat(result.historyPeriod()).isEqualTo("7d");
		verify(repository).upsertBoardSnapshot(any(), eq(11L), eq(21L), eq("present"), any(), eq("manual"), eq("done"), eq(null), any(), eq("manual"), eq(null), eq(OWNER_ID), any());
		verify(repository).insertHistory(any(), eq(11L), eq(21L), eq("present"), eq("done"), eq(null), eq("manual"), eq(OWNER_ID), any());
	}

	@Test void 변경이없으면쓰기없이board만반환한다() {
		when(repository.findOwnedMemberContext("space_alpha", "mem_1", OWNER_ID)).thenReturn(new StudentBoardWriteRepository.OwnedMemberContextRow(11L, 21L));
		when(repository.findBoardSnapshot(11L, 21L)).thenReturn(new StudentBoardWriteRepository.BoardSnapshotRow(
			"present", OffsetDateTime.parse("2026-05-08T01:00:00Z"), "manual", "done", null, OffsetDateTime.parse("2026-05-08T01:00:00Z"), "manual", null, OWNER_ID
		));
		when(readService.getBoard("space_alpha", OWNER_ID, "7d")).thenReturn(new StudentBoardReadResponse(List.of(), List.of(), "7d"));

		var request = new UpdateStudentBoardRequest();
		request.setAttendanceStatus("present");
		request.setAssignmentStatus("done");
		service.updateBoard("space_alpha", "mem_1", OWNER_ID, request);
		verify(repository, never()).upsertBoardSnapshot(any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any());
		verify(repository, never()).insertHistory(any(), any(), any(), any(), any(), any(), any(), any(), any());
	}
}
