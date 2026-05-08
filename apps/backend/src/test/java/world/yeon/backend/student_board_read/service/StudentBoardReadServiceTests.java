package world.yeon.backend.student_board_read.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import world.yeon.backend.student_board_read.repository.StudentBoardReadRepository;

@ExtendWith(MockitoExtension.class)
class StudentBoardReadServiceTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000951");
	@Mock private StudentBoardReadRepository repository;
	private StudentBoardReadService service;

	@BeforeEach void setUp() { service = new StudentBoardReadService(repository); }

	@Test void invalidPeriod면400이다() {
		assertThatThrownBy(() -> service.getBoard("space_alpha", OWNER_ID, "bad")).isInstanceOf(IllegalArgumentException.class);
	}

	@Test void board응답을조합한다() {
		when(repository.findOwnedSpaceContext("space_alpha", OWNER_ID)).thenReturn(new StudentBoardReadRepository.SpaceContextRow(11L, LocalDate.parse("2026-05-01"), LocalDate.parse("2026-05-31")));
		when(repository.findMembersInOwnedSpace("space_alpha", OWNER_ID)).thenReturn(List.of(
			new StudentBoardReadRepository.MemberRow(21L, "mem_1", "010-1234-5678")
		));
		when(repository.findBoardSnapshots(11L)).thenReturn(List.of(
			new StudentBoardReadRepository.BoardSnapshotRow(21L, "present", OffsetDateTime.parse("2026-05-08T01:00:00Z"), "manual", "done", null, OffsetDateTime.parse("2026-05-08T01:00:00Z"), "manual", OffsetDateTime.parse("2026-05-08T01:00:00Z"))
		));
		when(repository.findRecentSessions(11L)).thenReturn(List.of(
			new StudentBoardReadRepository.SessionRow("pcs_1", "체크인", "active", "attendance_and_assignment", List.of("qr"), "token123", null, null, null, null, OffsetDateTime.parse("2026-05-08T07:00:00Z"))
		));
		when(repository.findHistoryRows(eq(11L), any(), any())).thenReturn(List.of(
			new StudentBoardReadRepository.HistoryRow(21L, "present", "done", null, "manual", OffsetDateTime.parse("2026-05-08T01:00:00Z"))
		));

		var result = service.getBoard("space_alpha", OWNER_ID, "30d");
		assertThat(result.historyPeriod()).isEqualTo("30d");
		assertThat(result.rows()).hasSize(1);
		assertThat(result.rows().getFirst().memberId()).isEqualTo("mem_1");
		assertThat(result.rows().getFirst().isSelfCheckReady()).isTrue();
		assertThat(result.sessions()).hasSize(1);
		assertThat(result.sessions().getFirst().publicPath()).isEqualTo("/check/token123");
	}
}
