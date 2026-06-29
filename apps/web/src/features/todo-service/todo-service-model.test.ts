import { describe, expect, it } from "vitest";
import {
  TODO_TASK_ESTIMATES,
  TODO_TASK_PRIORITIES,
  TODO_TASK_STATUSES,
  carryOverTodoTasks,
  countCarryOverTasks,
  createTodoTask,
  groupTodoTasksForToday,
  parseTodoServiceState,
  setTodoTaskStatus,
} from "./todo-service-model";

const TODAY = "2026-06-29";
const YESTERDAY = "2026-06-28";
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

  it("오늘 그룹은 active, planned, inbox, doneToday를 분리한다", () => {
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
        { ...task("old"), plannedFor: YESTERDAY },
        done,
      ],
      TODAY
    );

    expect(groups.active?.id).toBe("active");
    expect(groups.planned.map((item) => item.id)).toEqual(["planned"]);
    expect(groups.inbox.map((item) => item.id)).toEqual(["old"]);
    expect(groups.doneToday.map((item) => item.id)).toEqual(["done"]);
  });
});
