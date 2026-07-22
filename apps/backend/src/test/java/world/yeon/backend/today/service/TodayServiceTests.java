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
import java.util.stream.IntStream;
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
	void 이미완료된할일은성공응답을잃고같은버전으로재시도해도최신상태를반환한다() {
		TodayRepository.TaskRow completed = task(
			"완료한 일",
			"normal",
			30,
			"done",
			LocalDate.parse("2026-07-22"),
			CREATED_AT.plusHours(2),
			4
		);
		when(repository.findTask(OWNER_ID, TASK_ID)).thenReturn(completed);

		TodayDtos.TaskResponse result = service.completeTask(
			OWNER_ID,
			TASK_ID,
			new TodayDtos.TransitionTaskRequest(3L)
		);

		assertThat(result.task().status()).isEqualTo("done");
		assertThat(result.task().version()).isEqualTo(4);
		verify(repository, never()).updateTaskStatus(eq(OWNER_ID), eq(TASK_ID), any(Long.class), any(), any(), any());
	}

	@Test
	void 이미재개된할일은성공응답을잃고같은버전으로재시도해도최신상태를반환한다() {
		TodayRepository.TaskRow planned = task(
			"다시 진행할 일",
			"normal",
			30,
			"planned",
			LocalDate.parse("2026-07-22"),
			null,
			6
		);
		when(repository.findTask(OWNER_ID, TASK_ID)).thenReturn(planned);

		TodayDtos.TaskResponse result = service.reopenTask(
			OWNER_ID,
			TASK_ID,
			new TodayDtos.TransitionTaskRequest(5L)
		);

		assertThat(result.task().status()).isEqualTo("planned");
		assertThat(result.task().version()).isEqualTo(6);
		verify(repository, never()).updateTaskStatus(eq(OWNER_ID), eq(TASK_ID), any(Long.class), any(), any(), any());
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
			List.of(new TodayRepository.ActivitySlotRow(9, 0, activity, null))
		);

		TodayDtos.RecordResponse result = service.getRecord(OWNER_ID, "2026-07-22");

		assertThat(result.slots()).hasSize(24);
		assertThat(result.slots().get(9).activityType().name()).isEqualTo("공부");
		assertThat(result.slots().get(9).entries()).hasSize(1);
		assertThat(result.summary().recordedHours()).isEqualTo(1);
		assertThat(result.summary().recordRate()).isEqualTo(4);
		assertThat(result.summary().activityMinutes()).containsEntry("공부", 60);
	}

	@Test
	void 하루기록조회는슬롯수와무관하게조인된슬롯을한번만조회한다() {
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
		LocalDate date = LocalDate.parse("2026-07-22");
		when(repository.listActivitySlots(OWNER_ID, date)).thenReturn(
			IntStream.range(0, 24)
				.mapToObj(hour -> new TodayRepository.ActivitySlotRow(hour, 0, activity, null))
				.toList()
		);

		TodayDtos.RecordResponse result = service.getRecord(OWNER_ID, date.toString());

		assertThat(result.slots()).hasSize(24);
		assertThat(result.summary().recordedHours()).isEqualTo(24);
		assertThat(result.summary().recordRate()).isEqualTo(100);
		verify(repository).listActivitySlots(OWNER_ID, date);
		verify(repository, never()).listActivityTypes(OWNER_ID);
		verify(repository, never()).findActivityType(eq(OWNER_ID), any());
	}

	@Test
	void 한시간에두활동을기록하면각각30분으로집계한다() {
		TodayRepository.ActivityTypeRow study = activity(
			"00000000-0000-0000-0000-000000001003",
			"공부",
			"blue",
			"book"
		);
		TodayRepository.ActivityTypeRow rest = activity(
			"00000000-0000-0000-0000-000000001004",
			"휴식",
			"yellow",
			"coffee"
		);
		when(repository.listActivitySlots(OWNER_ID, LocalDate.parse("2026-07-22"))).thenReturn(List.of(
			new TodayRepository.ActivitySlotRow(18, 0, study, "문서 읽기"),
			new TodayRepository.ActivitySlotRow(18, 1, rest, "커피 마시기")
		));

		TodayDtos.RecordResponse result = service.getRecord(OWNER_ID, "2026-07-22");

		assertThat(result.slots().get(18).entries())
			.extracting(TodayDtos.RecordEntry::entryIndex, entry -> entry.activityType().name(), TodayDtos.RecordEntry::note)
			.containsExactly(
				org.assertj.core.groups.Tuple.tuple(0, "공부", "문서 읽기"),
				org.assertj.core.groups.Tuple.tuple(1, "휴식", "커피 마시기")
			);
		assertThat(result.summary().recordedHours()).isEqualTo(1);
		assertThat(result.summary().activityMinutes())
			.containsEntry("공부", 30)
			.containsEntry("휴식", 30);
	}

	@Test
	void 같은활동을두번기록해도설명은분리하고시간은합산한다() {
		TodayRepository.ActivityTypeRow rest = activity(
			"00000000-0000-0000-0000-000000001003",
			"휴식",
			"yellow",
			"coffee"
		);
		when(repository.listActivitySlots(OWNER_ID, LocalDate.parse("2026-07-22"))).thenReturn(List.of(
			new TodayRepository.ActivitySlotRow(18, 0, rest, "산책"),
			new TodayRepository.ActivitySlotRow(18, 1, rest, "커피")
		));

		TodayDtos.RecordResponse result = service.getRecord(OWNER_ID, "2026-07-22");

		assertThat(result.slots().get(18).entries())
			.extracting(TodayDtos.RecordEntry::note)
			.containsExactly("산책", "커피");
		assertThat(result.summary().activityMinutes()).containsEntry("휴식", 60);
	}

	@Test
	void 비어있는순서에새기록을추가한다() {
		UUID activityId = UUID.fromString("00000000-0000-0000-0000-000000001003");
		TodayRepository.ActivityTypeRow activity = activity(
			activityId.toString(),
			"공부",
			"blue",
			"book"
		);
		LocalDate date = LocalDate.parse("2026-07-22");
		when(repository.findActivityType(OWNER_ID, activityId)).thenReturn(activity);
		when(repository.appendActivitySlot(eq(OWNER_ID), eq(date), eq(9), eq(activityId), eq("복습"), any()))
			.thenReturn(true);
		when(repository.listActivitySlots(OWNER_ID, date)).thenReturn(List.of(
			new TodayRepository.ActivitySlotRow(9, 0, activity, "복습")
		));

		TodayDtos.RecordResponse result = service.upsertRecordSlot(
			OWNER_ID,
			date.toString(),
			9,
			new TodayDtos.UpsertRecordSlotRequest(activityId, "복습", null)
		);

		assertThat(result.slots().get(9).entries()).hasSize(1);
		verify(repository).appendActivitySlot(eq(OWNER_ID), eq(date), eq(9), eq(activityId), eq("복습"), any());
		verify(repository, never()).updateActivitySlotEntry(any(), any(), any(Integer.class), any(Integer.class), any(), any(), any());
	}

	@Test
	void 두기록이이미있으면409를반환한다() {
		UUID activityId = UUID.fromString("00000000-0000-0000-0000-000000001003");
		TodayRepository.ActivityTypeRow activity = activity(
			activityId.toString(),
			"공부",
			"blue",
			"book"
		);
		LocalDate date = LocalDate.parse("2026-07-22");
		when(repository.findActivityType(OWNER_ID, activityId)).thenReturn(activity);
		when(repository.appendActivitySlot(eq(OWNER_ID), eq(date), eq(9), eq(activityId), isNull(), any()))
			.thenReturn(false);

		assertThatThrownBy(() -> service.upsertRecordSlot(
			OWNER_ID,
			date.toString(),
			9,
			new TodayDtos.UpsertRecordSlotRequest(activityId, null, null)
		)).isInstanceOf(TodayServiceException.class)
			.satisfies(error -> {
				TodayServiceException serviceError = (TodayServiceException) error;
				assertThat(serviceError.status()).isEqualTo(409);
				assertThat(serviceError.code()).isEqualTo("TODAY_RECORD_SLOT_FULL");
			});
	}

	@Test
	void 지정한기록순서의활동과설명만수정한다() {
		UUID activityId = UUID.fromString("00000000-0000-0000-0000-000000001003");
		TodayRepository.ActivityTypeRow activity = activity(
			activityId.toString(),
			"공부",
			"blue",
			"book"
		);
		LocalDate date = LocalDate.parse("2026-07-22");
		when(repository.findActivityType(OWNER_ID, activityId)).thenReturn(activity);
		when(repository.updateActivitySlotEntry(eq(OWNER_ID), eq(date), eq(9), eq(1), eq(activityId), eq("두 번째"), any()))
			.thenReturn(true);
		when(repository.listActivitySlots(OWNER_ID, date)).thenReturn(List.of(
			new TodayRepository.ActivitySlotRow(9, 1, activity, "두 번째")
		));

		service.upsertRecordSlot(
			OWNER_ID,
			date.toString(),
			9,
			new TodayDtos.UpsertRecordSlotRequest(activityId, "두 번째", 1)
		);

		verify(repository).updateActivitySlotEntry(
			eq(OWNER_ID), eq(date), eq(9), eq(1), eq(activityId), eq("두 번째"), any()
		);
		verify(repository, never()).appendActivitySlot(any(), any(), any(Integer.class), any(), any(), any());
	}

	@Test
	void 지정한기록하나만삭제한다() {
		LocalDate date = LocalDate.parse("2026-07-22");
		when(repository.deleteActivitySlotEntry(OWNER_ID, date, 9, 0)).thenReturn(true);
		when(repository.listActivitySlots(OWNER_ID, date)).thenReturn(List.of());

		TodayDtos.RecordResponse result = service.deleteRecordSlot(OWNER_ID, date.toString(), 9, 0);

		assertThat(result.slots().get(9).entries()).isEmpty();
		verify(repository).deleteActivitySlotEntry(OWNER_ID, date, 9, 0);
		verify(repository, never()).deleteActivitySlot(any(), any(), any(Integer.class));
	}

	@Test
	void 비활성활동은시간블록에기록하지않는다() {
		UUID activityId = UUID.fromString("00000000-0000-0000-0000-000000001003");
		TodayRepository.ActivityTypeRow inactiveActivity = new TodayRepository.ActivityTypeRow(
			activityId,
			OWNER_ID,
			"숨긴 활동",
			"gray",
			"circle",
			0,
			false,
			1
		);
		when(repository.findActivityType(OWNER_ID, activityId)).thenReturn(inactiveActivity);

		assertThatThrownBy(() -> service.upsertRecordSlot(
			OWNER_ID,
			"2026-07-22",
			9,
			new TodayDtos.UpsertRecordSlotRequest(activityId, null, null)
		)).isInstanceOf(TodayServiceException.class)
			.satisfies(error -> {
				TodayServiceException serviceError = (TodayServiceException) error;
				assertThat(serviceError.status()).isEqualTo(409);
				assertThat(serviceError.code()).isEqualTo("TODAY_ACTIVITY_INACTIVE");
			});
		verify(repository, never()).listActivityTypes(OWNER_ID);
		verify(repository, never()).appendActivitySlot(any(), any(), any(Integer.class), any(), any(), any());
	}

	@Test
	void 하루기록시간은0시부터23시까지만허용한다() {
		UUID activityId = UUID.fromString("00000000-0000-0000-0000-000000001003");

		assertThatThrownBy(() -> service.upsertRecordSlot(
			OWNER_ID,
			"2026-07-22",
			24,
			new TodayDtos.UpsertRecordSlotRequest(activityId, null, null)
		)).isInstanceOf(TodayServiceException.class)
			.satisfies(error -> assertThat(((TodayServiceException) error).status()).isEqualTo(400));
		verify(repository, never()).findActivityType(any(), any());
		verify(repository, never()).appendActivitySlot(any(), any(), any(Integer.class), any(), any(), any());
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

	private TodayRepository.ActivityTypeRow activity(
		String id,
		String name,
		String colorToken,
		String iconKey
	) {
		return new TodayRepository.ActivityTypeRow(
			UUID.fromString(id),
			OWNER_ID,
			name,
			colorToken,
			iconKey,
			0,
			true,
			0
		);
	}
}
