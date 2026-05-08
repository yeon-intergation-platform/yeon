package world.yeon.backend.student_board_history.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
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
import world.yeon.backend.student_board_history.repository.StudentBoardHistoryRepository;

@ExtendWith(MockitoExtension.class)
class StudentBoardHistoryServiceTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000931");
	@Mock private StudentBoardHistoryRepository repository;
	private StudentBoardHistoryService service;

	@BeforeEach void setUp() {
		service = new StudentBoardHistoryService(repository);
	}

	@Test void invalidPeriod면400이다() {
		assertThatThrownBy(() -> service.getMemberHistory("space_alpha", "mem_1", OWNER_ID, "bad"))
			.isInstanceOf(IllegalArgumentException.class);
	}

	@Test void history응답을조합한다() {
		when(repository.findOwnedMemberContext("space_alpha", "mem_1", OWNER_ID))
			.thenReturn(new StudentBoardHistoryRepository.MemberContextRow(11L, 21L, "mem_1", "홍길동", LocalDate.parse("2026-05-01"), LocalDate.parse("2026-05-31")));
		when(repository.findHistoryRows(eq(11L), eq(21L), org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any()))
			.thenReturn(List.of(
				new StudentBoardHistoryRepository.BoardHistoryRow("smbh_1", 21L, "present", "done", null, "manual", OffsetDateTime.parse("2026-05-08T01:00:00Z")),
				new StudentBoardHistoryRepository.BoardHistoryRow("smbh_2", 21L, "present", "done", null, "manual", OffsetDateTime.parse("2026-05-08T00:00:00Z"))
			));
		var result = service.getMemberHistory("space_alpha", "mem_1", OWNER_ID, "30d");
		assertThat(result.period()).isEqualTo("30d");
		assertThat(result.dailyCells()).hasSize(1);
		assertThat(result.history()).hasSize(2);
	}
}
