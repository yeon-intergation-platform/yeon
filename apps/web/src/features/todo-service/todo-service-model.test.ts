import { describe, expect, it } from "vitest";
import {
  TODO_TASK_ESTIMATES,
  TODO_TASK_PRIORITIES,
  TODO_TASK_STATUSES,
  addTodoServiceDays,
  addTodoServiceMonths,
  buildTodoServiceCalendarMonth,
  buildTodoTaskRecommendations,
  calculateTodoTaskBenefitScore,
  carryOverTodoTasks,
  countCarryOverTasks,
  createTodoTask,
  getTodoTaskEstimateMinutes,
  groupTodoTasksForToday,
  parseTodoServiceState,
  setTodoTaskStatus,
} from "./todo-service-model";

const TODAY = "2026-06-29";
const YESTERDAY = "2026-06-28";
const TOMORROW = "2026-06-30";
const NOW = "2026-06-29T09:00:00.000Z";

function task(id: string, title = `할 일 ${id}`) {
  return createTodoTask({
    id,
    title,
    priority: TODO_TASK_PRIORITIES.normal,
    estimate: TODO_TASK_ESTIMATES.fifteen,
    today: TODAY,
    nowIso: NOW,
  });
}

describe("todo-service-model", () => {
  it("깨진 저장값은 빈 오늘 상태로 복구한다", () => {
    expect(parseTodoServiceState("{", TODAY, NOW)).toEqual({
      version: 1,
      lastOpenedDate: TODAY,
      tasks: [],
    });
  });

  it("저장값을 읽을 때 제목 없는 task와 잘못된 enum 값을 정리한다", () => {
    const state = parseTodoServiceState(
      JSON.stringify({
        lastOpenedDate: "2026-06-28",
        tasks: [
          { id: "empty", title: "" },
          {
            id: "valid",
            title: "  오늘   보드 만들기  ",
            priority: "wrong",
            estimate: "wrong",
            status: "wrong",
          },
        ],
      }),
      TODAY,
      NOW
    );

    expect(state.tasks).toEqual([
      expect.objectContaining({
        id: "valid",
        title: "오늘 보드 만들기",
        priority: TODO_TASK_PRIORITIES.normal,
        estimate: TODO_TASK_ESTIMATES.fifteen,
        status: TODO_TASK_STATUSES.inbox,
      }),
    ]);
  });

  it("active로 바꾸면 기존 active는 planned로 되돌린다", () => {
    const firstActive = setTodoTaskStatus({
      tasks: [task("a"), task("b")],
      taskId: "a",
      status: TODO_TASK_STATUSES.active,
      today: TODAY,
      nowIso: NOW,
    });
    const nextActive = setTodoTaskStatus({
      tasks: firstActive,
      taskId: "b",
      status: TODO_TASK_STATUSES.active,
      today: TODAY,
      nowIso: "2026-06-29T09:10:00.000Z",
    });

    expect(nextActive).toEqual([
      expect.objectContaining({ id: "a", status: TODO_TASK_STATUSES.planned }),
      expect.objectContaining({ id: "b", status: TODO_TASK_STATUSES.active }),
    ]);
  });

  it("이미 active인 task를 active로 다시 지정해도 자기 자신을 planned로 되돌리지 않는다", () => {
    const [activeTask] = setTodoTaskStatus({
      tasks: [task("a")],
      taskId: "a",
      status: TODO_TASK_STATUSES.active,
      today: TODAY,
      nowIso: NOW,
    });

    const [sameActiveTask] = setTodoTaskStatus({
      tasks: [activeTask!],
      taskId: "a",
      status: TODO_TASK_STATUSES.active,
      today: TODAY,
      nowIso: "2026-06-29T09:20:00.000Z",
    });

    expect(sameActiveTask).toEqual(
      expect.objectContaining({
        id: "a",
        status: TODO_TASK_STATUSES.active,
        plannedFor: TODAY,
      })
    );
  });

  it("전날 미완료 task를 오늘로 이어오거나 inbox로 되돌린다", () => {
    const staleTask = {
      ...task("old"),
      plannedFor: YESTERDAY,
      status: TODO_TASK_STATUSES.active,
    };

    expect(countCarryOverTasks([staleTask], TODAY)).toBe(1);
    expect(
      carryOverTodoTasks({
        tasks: [staleTask],
        mode: "continue",
        today: TODAY,
        nowIso: NOW,
      })
    ).toEqual([
      expect.objectContaining({
        id: "old",
        status: TODO_TASK_STATUSES.planned,
        plannedFor: TODAY,
      }),
    ]);
    expect(
      carryOverTodoTasks({
        tasks: [staleTask],
        mode: "inbox",
        today: TODAY,
        nowIso: NOW,
      })
    ).toEqual([
      expect.objectContaining({
        id: "old",
        status: TODO_TASK_STATUSES.inbox,
        plannedFor: null,
      }),
    ]);
  });

  it("미래 날짜 task는 carry-over 대상으로 보지 않는다", () => {
    const futureTask = {
      ...task("future"),
      plannedFor: TOMORROW,
      status: TODO_TASK_STATUSES.planned,
    };

    expect(countCarryOverTasks([futureTask], TODAY)).toBe(0);
    expect(
      carryOverTodoTasks({
        tasks: [futureTask],
        mode: "continue",
        today: TODAY,
        nowIso: NOW,
      })
    ).toEqual([futureTask]);
  });

  it("선택 날짜 그룹은 해당 날짜 active, planned, done만 분리한다", () => {
    const done = setTodoTaskStatus({
      tasks: [task("done")],
      taskId: "done",
      status: TODO_TASK_STATUSES.done,
      today: TODAY,
      nowIso: NOW,
    })[0]!;
    const groups = groupTodoTasksForToday(
      [
        { ...task("active"), status: TODO_TASK_STATUSES.active },
        task("planned"),
        {
          ...task("future-active"),
          status: TODO_TASK_STATUSES.active,
          plannedFor: TOMORROW,
        },
        { ...task("old"), plannedFor: YESTERDAY },
        {
          ...task("inbox"),
          status: TODO_TASK_STATUSES.inbox,
          plannedFor: null,
        },
        done,
      ],
      TODAY
    );

    expect(groups.active?.id).toBe("active");
    expect(groups.planned.map((item) => item.id)).toEqual(["planned"]);
    expect(groups.inbox.map((item) => item.id)).toEqual(["inbox"]);
    expect(groups.doneToday.map((item) => item.id)).toEqual(["done"]);
  });

  it("날짜와 월 이동을 로컬 날짜 문자열로 계산한다", () => {
    expect(addTodoServiceDays("2026-06-01", -1)).toBe("2026-05-31");
    expect(addTodoServiceDays("2026-06-30", 1)).toBe("2026-07-01");
    expect(addTodoServiceMonths("2026-06-29", -1)).toBe("2026-05-01");
    expect(addTodoServiceMonths("2026-06-29", 1)).toBe("2026-07-01");
  });

  it("예상 시간은 분 단위로 계산한다", () => {
    expect(getTodoTaskEstimateMinutes(TODO_TASK_ESTIMATES.fifteen)).toBe(15);
    expect(getTodoTaskEstimateMinutes(TODO_TASK_ESTIMATES.hour)).toBe(60);
    expect(getTodoTaskEstimateMinutes(TODO_TASK_ESTIMATES.twoHours)).toBe(120);
  });

  it("추천 목록은 우선순위와 예상 시간, 메모를 기준으로 점수가 높은 순서로 만든다", () => {
    const important = {
      ...task("important"),
      priority: TODO_TASK_PRIORITIES.important,
      estimate: TODO_TASK_ESTIMATES.fifteen,
      note: "바로 시작",
    };
    const normal = {
      ...task("normal"),
      priority: TODO_TASK_PRIORITIES.normal,
      estimate: TODO_TASK_ESTIMATES.thirty,
    };
    const light = {
      ...task("light"),
      priority: TODO_TASK_PRIORITIES.light,
      estimate: TODO_TASK_ESTIMATES.twoHours,
    };
    const done = setTodoTaskStatus({
      tasks: [task("done")],
      taskId: "done",
      status: TODO_TASK_STATUSES.done,
      today: TODAY,
      nowIso: NOW,
    })[0]!;

    const recommendations = buildTodoTaskRecommendations(
      [light, normal, done, important],
      2
    );

    expect(calculateTodoTaskBenefitScore(important)).toBeGreaterThan(
      calculateTodoTaskBenefitScore(normal)
    );
    expect(recommendations.map((item) => item.task.id)).toEqual([
      "important",
      "normal",
    ]);
    expect(recommendations.map((item) => item.rank)).toEqual([1, 2]);
  });

  it("월간 달력은 6주 그리드와 날짜별 open/done 요약을 만든다", () => {
    const done = setTodoTaskStatus({
      tasks: [task("done")],
      taskId: "done",
      status: TODO_TASK_STATUSES.done,
      today: TODAY,
      nowIso: NOW,
    })[0]!;
    const calendar = buildTodoServiceCalendarMonth({
      tasks: [
        { ...task("planned"), plannedFor: TODAY },
        {
          ...task("active"),
          status: TODO_TASK_STATUSES.active,
          plannedFor: TODAY,
        },
        done,
        { ...task("tomorrow"), plannedFor: TOMORROW },
      ],
      visibleDate: TODAY,
      selectedDate: TODAY,
      today: TODAY,
    });

    expect(calendar).toHaveLength(42);
    const selectedDay = calendar.find((day) => day.date === TODAY);
    const tomorrow = calendar.find((day) => day.date === TOMORROW);

    expect(selectedDay).toEqual(
      expect.objectContaining({
        isSelected: true,
        isToday: true,
        openCount: 2,
        doneCount: 1,
        totalCount: 3,
      })
    );
    expect(tomorrow).toEqual(
      expect.objectContaining({
        openCount: 1,
        doneCount: 0,
        totalCount: 1,
      })
    );
  });
});
