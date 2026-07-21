package world.yeon.backend.today.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
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
import world.yeon.backend.today.dto.TodayDtos;
import world.yeon.backend.today.repository.TodayRepository;

@ExtendWith(MockitoExtension.class)
class TodayServiceTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000001001");
	private static final UUID TASK_ID = UUID.fromString("00000000-0000-0000-0000-000000001002");
	private static final OffsetDateTime CREATED_AT = OffsetDateTime.parse("2026-07-22T01:00:00Z");

	@Mock private TodayRepository repository;
	private TodayService service;

	@BeforeEach
	void setUp() {
		service = new TodayService(repository);
	}

	@Test
	void 날짜별보드는완료율과예상시간을서버데이터에서계산한다() {
		when(repository.listBoardTasks(OWNER_ID, LocalDate.parse("2026-07-22"))).thenReturn(List.of(
			task("첫 번째 일", "high", 45, "planned", LocalDate.parse("2026-07-22"), null, 0),
			task("완료한 일", "normal", 30, "done", LocalDate.parse("2026-07-22"), CREATED_AT.plusHours(2), 1),
			task("나중에 정할 일", "low", 20, "inbox", null, null, 0)
		));

		TodayDtos.BoardResponse result = service.getBoard(OWNER_ID, "2026-07-22");

		assertThat(result.summary().totalCount()).isEqualTo(2);
		assertThat(result.summary().completedCount()).isEqualTo(1);
		assertThat(result.summary().completionRate()).isEqualTo(50);
		assertThat(result.summary().estimatedMinutes()).isEqualTo(75);
		assertThat(result.inboxCount()).isEqualTo(1);
		assertThat(result.recommendation().task().title()).isEqualTo("첫 번째 일");
	}

	@Test
	void 날짜없는할일은Inbox상태로저장한다() {
		TodayRepository.TaskRow inbox = task("문서 정리", "normal", 30, "inbox", null, null, 0);
		when(repository.insertTask(
			eq(OWNER_ID),
			eq("문서 정리"),
			eq("normal"),
			eq(30),
			eq(null),
			eq("inbox"),
			eq(null),
			any()
		)).thenReturn(inbox);

		TodayDtos.TaskResponse result = service.createTask(
			OWNER_ID,
			new TodayDtos.CreateTaskRequest("  문서   정리  ", null, null, null, null)
		);

		assertThat(result.task().status()).isEqualTo("inbox");
		assertThat(result.task().title()).isEqualTo("문서 정리");
	}

	@Test
	void 오래된버전으로완료하면409충돌을반환한다() {
		when(repository.findTask(OWNER_ID, TASK_ID)).thenReturn(
			task("업데이트된 일", "normal", 30, "planned", LocalDate.parse("2026-07-22"), null, 3)
		);

		assertThatThrownBy(() -> service.completeTask(
			OWNER_ID,
			TASK_ID,
			new TodayDtos.TransitionTaskRequest(2L)
		)).isInstanceOf(TodayServiceException.class)
			.satisfies(error -> assertThat(((TodayServiceException) error).status()).isEqualTo(409));
	}

	@Test
	void 완료한할일을Inbox로이동하면완료상태도함께해제한다() {
		TodayRepository.TaskRow completed = task(
			"완료한 일",
			"normal",
			30,
			"done",
			LocalDate.parse("2026-07-22"),
			CREATED_AT.plusHours(2),
			2
		);
		TodayRepository.TaskRow moved = task("완료한 일", "normal", 30, "inbox", null, null, 3);
		when(repository.findTask(OWNER_ID, TASK_ID)).thenReturn(completed, moved);
		when(repository.updateTask(
			eq(OWNER_ID),
			eq(TASK_ID),
			eq(2L),
			eq("완료한 일"),
			eq("normal"),
			eq(30),
			isNull(),
			eq("inbox"),
			isNull(),
			isNull(),
			any()
		)).thenReturn(true);

		TodayDtos.TaskResponse result = service.updateTask(
			OWNER_ID,
			TASK_ID,
			new TodayDtos.UpdateTaskRequest(2L, "완료한 일", "normal", 30, null, null)
		);

		assertThat(result.task().status()).isEqualTo("inbox");
		assertThat(result.task().plannedDate()).isNull();
		assertThat(result.task().completedAt()).isNull();
	}

	@Test
	void 하루기록은비어있는시간까지24칸을반환한다() {
		TodayRepository.ActivityTypeRow activity = new TodayRepository.ActivityTypeRow(
			UUID.fromString("00000000-0000-0000-0000-000000001003"),
			OWNER_ID,
			"공부",
			"blue",
			"book",
			0,
			true,
			0
		);
		when(repository.listActivitySlots(OWNER_ID, LocalDate.parse("2026-07-22"))).thenReturn(
			List.of(new TodayRepository.ActivitySlotRow(9, activity, null))
		);

		TodayDtos.RecordResponse result = service.getRecord(OWNER_ID, "2026-07-22");

		assertThat(result.slots()).hasSize(24);
		assertThat(result.slots().get(9).activityType().name()).isEqualTo("공부");
		assertThat(result.summary().recordedHours()).isEqualTo(1);
		assertThat(result.summary().recordRate()).isEqualTo(4);
		assertThat(result.summary().activityMinutes()).containsEntry("공부", 60);
	}

	@Test
	void 사용자가활동을수정한뒤에는기본활동을다시추가하지않는다() {
		TodayRepository.ActivityTypeRow renamedActivity = new TodayRepository.ActivityTypeRow(
			UUID.fromString("00000000-0000-0000-0000-000000001003"),
			OWNER_ID,
			"집중 공부",
			"blue",
			"book",
			0,
			true,
			1
		);
		when(repository.listActivityTypes(OWNER_ID)).thenReturn(List.of(renamedActivity));

		service.listActivityTypes(OWNER_ID);

		verify(repository, never()).ensureDefaultActivityTypes(eq(OWNER_ID), any(), any());
	}

	private TodayRepository.TaskRow task(
		String title,
		String priority,
		int estimatedMinutes,
		String status,
		LocalDate plannedDate,
		OffsetDateTime completedAt,
		long version
	) {
		return new TodayRepository.TaskRow(
			TASK_ID,
			OWNER_ID,
			title,
			priority,
			estimatedMinutes,
			null,
			status,
			plannedDate,
			completedAt,
			version,
			CREATED_AT,
			CREATED_AT
		);
	}
}
