package world.yeon.backend.activity_logs.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import world.yeon.backend.activity_logs.dto.CreateActivityLogRequest;
import world.yeon.backend.activity_logs.repository.ActivityLogRepository;

@ExtendWith(MockitoExtension.class)
class ActivityLogServiceTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000921");
	@Mock private ActivityLogRepository repository;
	private ActivityLogService service;

	@BeforeEach void setUp() {
		service = new ActivityLogService(repository);
		when(repository.findOwnedMemberInSpace("space_alpha", "mem_1", OWNER_ID))
			.thenReturn(new ActivityLogRepository.OwnedMemberRow(31L, 11L, "mem_1", "space_alpha"));
	}

	@Test void list는개수와로그를함께반환한다() {
		when(repository.findActivityLogs(11L, 31L, "coaching-note", 100)).thenReturn(java.util.List.of(
			new ActivityLogRepository.ActivityLogRow("alg_1", "mem_1", "space_alpha", "coaching-note", null, OffsetDateTime.parse("2026-05-08T07:00:00Z"), "manual", Map.of("noteText", "메모"), OffsetDateTime.parse("2026-05-08T07:00:00Z"))
		));
		when(repository.countActivityLogs(11L, 31L, "coaching-note")).thenReturn(1);
		var result = service.getActivityLogs("space_alpha", "mem_1", OWNER_ID, "coaching-note", 100);
		assertThat(result.totalCount()).isEqualTo(1);
		assertThat(result.logs()).hasSize(1);
	}

	@Test void 빈메모는400이다() {
		assertThatThrownBy(() -> service.createMemoLog("space_alpha", "mem_1", OWNER_ID, new CreateActivityLogRequest("   \n ", null)))
			.isInstanceOf(IllegalArgumentException.class)
			.hasMessage("메모 내용을 입력해 주세요.");
	}

	@Test void 메모생성은기본작성자를멘토로넣는다() {
		when(repository.insertMemoLog(eq(11L), eq(31L), any(), any(), eq("coaching-note"), eq("manual"), eq(null), any()))
			.thenReturn(new ActivityLogRepository.ActivityLogRow("alg_1", "mem_1", "space_alpha", "coaching-note", null, OffsetDateTime.parse("2026-05-08T07:00:00Z"), "manual", Map.of("noteText", "첫 줄 두 번째 줄", "authorLabel", "멘토"), OffsetDateTime.parse("2026-05-08T07:00:00Z")));
		var result = service.createMemoLog("space_alpha", "mem_1", OWNER_ID, new CreateActivityLogRequest("  첫 줄\n\n두 번째 줄  ", null));
		assertThat(result.log().metadata()).containsEntry("authorLabel", "멘토");
		assertThat(result.log().metadata()).containsEntry("noteText", "첫 줄 두 번째 줄");
	}
}
