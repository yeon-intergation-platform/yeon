export const TODO_TASK_STATUSES = {
  inbox: "inbox",
  planned: "planned",
  active: "active",
  done: "done",
  deferred: "deferred",
} as const;

export type TodoTaskStatus =
  (typeof TODO_TASK_STATUSES)[keyof typeof TODO_TASK_STATUSES];

export const TODO_TASK_PRIORITIES = {
  important: "important",
  normal: "normal",
  light: "light",
} as const;

export type TodoTaskPriority =
  (typeof TODO_TASK_PRIORITIES)[keyof typeof TODO_TASK_PRIORITIES];

export const TODO_TASK_ESTIMATES = {
  five: "5m",
  fifteen: "15m",
  thirty: "30m",
  hour: "60m",
} as const;

export type TodoTaskEstimate =
  (typeof TODO_TASK_ESTIMATES)[keyof typeof TODO_TASK_ESTIMATES];

export type TodoTask = {
  id: string;
  title: string;
  note: string;
  priority: TodoTaskPriority;
  estimate: TodoTaskEstimate;
  status: TodoTaskStatus;
  plannedFor: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  completedOn: string | null;
};

export type TodoServiceState = {
  version: 1;
  lastOpenedDate: string;
  tasks: TodoTask[];
};

export type TodoTaskGroups = {
  active: TodoTask | null;
  planned: TodoTask[];
  inbox: TodoTask[];
  doneToday: TodoTask[];
};

const TODO_STATE_VERSION = 1;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isIsoLocalDate(value: unknown): value is string {
  return typeof value === "string" && ISO_DATE_PATTERN.test(value);
}

function normalizeTaskTitle(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function normalizeNote(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizePriority(value: unknown): TodoTaskPriority {
  return Object.values(TODO_TASK_PRIORITIES).includes(value as TodoTaskPriority)
    ? (value as TodoTaskPriority)
    : TODO_TASK_PRIORITIES.normal;
}

function normalizeEstimate(value: unknown): TodoTaskEstimate {
  return Object.values(TODO_TASK_ESTIMATES).includes(value as TodoTaskEstimate)
    ? (value as TodoTaskEstimate)
    : TODO_TASK_ESTIMATES.fifteen;
}

function normalizeStatus(value: unknown): TodoTaskStatus {
  return Object.values(TODO_TASK_STATUSES).includes(value as TodoTaskStatus)
    ? (value as TodoTaskStatus)
    : TODO_TASK_STATUSES.inbox;
}

function normalizeDateOrNull(value: unknown) {
  return isIsoLocalDate(value) ? value : null;
}

function normalizeTimestamp(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function createDefaultState(today: string): TodoServiceState {
  return {
    version: TODO_STATE_VERSION,
    lastOpenedDate: today,
    tasks: [],
  };
}

function sanitizeTask(value: unknown, nowIso: string): TodoTask | null {
  if (!isRecord(value) || typeof value.id !== "string") return null;

  const title = normalizeTaskTitle(value.title);
  if (!title) return null;

  const status = normalizeStatus(value.status);
  const completedAt =
    status === TODO_TASK_STATUSES.done
      ? normalizeTimestamp(value.completedAt, nowIso)
      : null;
  const completedOn =
    status === TODO_TASK_STATUSES.done
      ? normalizeDateOrNull(value.completedOn)
      : null;

  return {
    id: value.id,
    title,
    note: normalizeNote(value.note),
    priority: normalizePriority(value.priority),
    estimate: normalizeEstimate(value.estimate),
    status,
    plannedFor: normalizeDateOrNull(value.plannedFor),
    createdAt: normalizeTimestamp(value.createdAt, nowIso),
    updatedAt: normalizeTimestamp(value.updatedAt, nowIso),
    completedAt,
    completedOn,
  };
}

export function getTodayServiceLocalDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function parseTodoServiceState(
  rawValue: string | null | undefined,
  today: string,
  nowIso = new Date().toISOString()
): TodoServiceState {
  if (!rawValue) return createDefaultState(today);

  try {
    const parsed = JSON.parse(rawValue) as unknown;
    if (!isRecord(parsed)) return createDefaultState(today);

    const tasks = Array.isArray(parsed.tasks)
      ? parsed.tasks
          .map((task) => sanitizeTask(task, nowIso))
          .filter((task): task is TodoTask => task !== null)
      : [];

    return {
      version: TODO_STATE_VERSION,
      lastOpenedDate: isIsoLocalDate(parsed.lastOpenedDate)
        ? parsed.lastOpenedDate
        : today,
      tasks,
    };
  } catch {
    return createDefaultState(today);
  }
}

export function createTodoTask({
  id,
  title,
  priority,
  estimate,
  today,
  nowIso,
  status = TODO_TASK_STATUSES.planned,
}: {
  id: string;
  title: string;
  priority: TodoTaskPriority;
  estimate: TodoTaskEstimate;
  today: string;
  nowIso: string;
  status?: Extract<TodoTaskStatus, "inbox" | "planned">;
}): TodoTask {
  const normalizedTitle = normalizeTaskTitle(title);
  if (!normalizedTitle) {
    throw new Error("할 일 제목은 비워둘 수 없습니다.");
  }

  return {
    id,
    title: normalizedTitle,
    note: "",
    priority,
    estimate,
    status,
    plannedFor: status === TODO_TASK_STATUSES.planned ? today : null,
    createdAt: nowIso,
    updatedAt: nowIso,
    completedAt: null,
    completedOn: null,
  };
}

export function setTodoTaskStatus({
  tasks,
  taskId,
  status,
  today,
  nowIso,
}: {
  tasks: readonly TodoTask[];
  taskId: string;
  status: TodoTaskStatus;
  today: string;
  nowIso: string;
}): TodoTask[] {
  return tasks.map((task) => {
    if (task.id !== taskId) {
      if (status === TODO_TASK_STATUSES.active && task.status === "active") {
        return {
          ...task,
          status: TODO_TASK_STATUSES.planned,
          plannedFor: today,
          updatedAt: nowIso,
        };
      }

      return task;
    }

    if (task.status === status && status === TODO_TASK_STATUSES.active) {
      return {
        ...task,
        plannedFor: today,
        completedAt: null,
        completedOn: null,
        updatedAt: nowIso,
      };
    }

    if (status === TODO_TASK_STATUSES.done) {
      return {
        ...task,
        status,
        plannedFor: task.plannedFor ?? today,
        completedAt: nowIso,
        completedOn: today,
        updatedAt: nowIso,
      };
    }

    if (status === TODO_TASK_STATUSES.planned) {
      return {
        ...task,
        status,
        plannedFor: today,
        completedAt: null,
        completedOn: null,
        updatedAt: nowIso,
      };
    }

    if (status === TODO_TASK_STATUSES.active) {
      return {
        ...task,
        status,
        plannedFor: today,
        completedAt: null,
        completedOn: null,
        updatedAt: nowIso,
      };
    }

    return {
      ...task,
      status,
      plannedFor: null,
      completedAt: null,
      completedOn: null,
      updatedAt: nowIso,
    };
  });
}

export function updateTodoTaskNote({
  tasks,
  taskId,
  note,
  nowIso,
}: {
  tasks: readonly TodoTask[];
  taskId: string;
  note: string;
  nowIso: string;
}) {
  return tasks.map((task) =>
    task.id === taskId
      ? {
          ...task,
          note,
          updatedAt: nowIso,
        }
      : task
  );
}

export function removeTodoTask(tasks: readonly TodoTask[], taskId: string) {
  return tasks.filter((task) => task.id !== taskId);
}

export function countCarryOverTasks(tasks: readonly TodoTask[], today: string) {
  return tasks.filter(
    (task) =>
      task.plannedFor !== null &&
      task.plannedFor !== today &&
      (task.status === TODO_TASK_STATUSES.planned ||
        task.status === TODO_TASK_STATUSES.active)
  ).length;
}

export function carryOverTodoTasks({
  tasks,
  mode,
  today,
  nowIso,
}: {
  tasks: readonly TodoTask[];
  mode: "continue" | "inbox";
  today: string;
  nowIso: string;
}) {
  return tasks.map((task) => {
    const shouldCarry =
      task.plannedFor !== null &&
      task.plannedFor !== today &&
      (task.status === TODO_TASK_STATUSES.planned ||
        task.status === TODO_TASK_STATUSES.active);

    if (!shouldCarry) return task;

    return {
      ...task,
      status:
        mode === "continue"
          ? TODO_TASK_STATUSES.planned
          : TODO_TASK_STATUSES.inbox,
      plannedFor: mode === "continue" ? today : null,
      updatedAt: nowIso,
    };
  });
}

export function groupTodoTasksForToday(
  tasks: readonly TodoTask[],
  today: string
): TodoTaskGroups {
  const active = tasks.find((task) => task.status === "active") ?? null;
  const planned = tasks.filter(
    (task) => task.status === "planned" && task.plannedFor === today
  );
  const inbox = tasks.filter(
    (task) =>
      task.status === "inbox" ||
      task.status === "deferred" ||
      (task.status === "planned" && task.plannedFor !== today)
  );
  const doneToday = tasks.filter(
    (task) => task.status === "done" && task.completedOn === today
  );

  return {
    active,
    planned,
    inbox,
    doneToday,
  };
}

export function countOpenTodayTasks(
  groups: Pick<TodoTaskGroups, "active" | "planned">
) {
  return groups.planned.length + (groups.active ? 1 : 0);
}
