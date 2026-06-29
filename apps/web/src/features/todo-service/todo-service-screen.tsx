"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Archive,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Circle,
  Inbox,
  ListTodo,
  Play,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { YeonButton, YeonField, YeonText, YeonView } from "@yeon/ui";
import { CommonProductHeader } from "@/components/product-shell/product-header";
import {
  TODO_TASK_ESTIMATES,
  TODO_TASK_PRIORITIES,
  TODO_TASK_STATUSES,
  carryOverTodoTasks,
  countCarryOverTasks,
  countOpenTodayTasks,
  createTodoTask,
  getTodayServiceLocalDate,
  groupTodoTasksForToday,
  parseTodoServiceState,
  removeTodoTask,
  setTodoTaskStatus,
  updateTodoTaskNote,
  type TodoServiceState,
  type TodoTask,
  type TodoTaskEstimate,
  type TodoTaskPriority,
  type TodoTaskStatus,
} from "./todo-service-model";

const STORAGE_KEY = "yeon.todo-service.state.v1";
const TODAY_LIMIT = 5;

const PRIORITY_OPTIONS: {
  value: TodoTaskPriority;
  label: string;
  className: string;
}[] = [
  {
    value: TODO_TASK_PRIORITIES.important,
    label: "중요",
    className: "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]",
  },
  {
    value: TODO_TASK_PRIORITIES.normal,
    label: "보통",
    className: "border-[#e5e5e5] bg-white text-[#3f3f46]",
  },
  {
    value: TODO_TASK_PRIORITIES.light,
    label: "가벼움",
    className: "border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]",
  },
];

const ESTIMATE_OPTIONS: { value: TodoTaskEstimate; label: string }[] = [
  { value: TODO_TASK_ESTIMATES.five, label: "5분" },
  { value: TODO_TASK_ESTIMATES.fifteen, label: "15분" },
  { value: TODO_TASK_ESTIMATES.thirty, label: "30분" },
  { value: TODO_TASK_ESTIMATES.hour, label: "1시간+" },
];

function createClientTaskId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getNowIso() {
  return new Date().toISOString();
}

function readStoredState(today: string) {
  if (typeof window === "undefined") {
    return parseTodoServiceState(null, today);
  }
  return parseTodoServiceState(window.localStorage.getItem(STORAGE_KEY), today);
}

function formatTodayLabel(today: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${today}T00:00:00`));
}

function taskOptionLabel<T extends string>(
  options: readonly { value: T; label: string }[],
  value: T
) {
  return options.find((option) => option.value === value)?.label ?? value;
}

function StatusBadge({ task }: { task: TodoTask }) {
  const priority = PRIORITY_OPTIONS.find(
    (option) => option.value === task.priority
  );

  return (
    <YeonView className="flex flex-wrap items-center gap-1.5">
      <YeonText
        as="span"
        variant="unstyled"
        tone="inherit"
        className={`inline-flex h-6 items-center rounded-full border px-2 text-[11px] font-bold ${
          priority?.className ?? "border-[#e5e5e5] bg-white text-[#3f3f46]"
        }`}
      >
        {priority?.label ?? "보통"}
      </YeonText>
      <YeonText
        as="span"
        variant="unstyled"
        tone="inherit"
        className="inline-flex h-6 items-center rounded-full border border-[#e5e5e5] bg-[#fafafa] px-2 text-[11px] font-bold text-[#52525b]"
      >
        {taskOptionLabel(ESTIMATE_OPTIONS, task.estimate)}
      </YeonText>
    </YeonView>
  );
}

function IconButton({
  label,
  onClick,
  children,
  tone = "default",
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2 ${
        tone === "danger"
          ? "border-[#fee2e2] bg-white text-[#b91c1c] hover:bg-[#fef2f2]"
          : "border-[#e5e5e5] bg-white text-[#3f3f46] hover:border-[#2563eb] hover:text-[#2563eb]"
      }`}
    >
      {children}
    </button>
  );
}

function TaskCard({
  task,
  onStatus,
  onDelete,
  onNoteChange,
}: {
  task: TodoTask;
  onStatus: (taskId: string, status: TodoTaskStatus) => void;
  onDelete: (taskId: string) => void;
  onNoteChange: (taskId: string, note: string) => void;
}) {
  const isDone = task.status === TODO_TASK_STATUSES.done;

  return (
    <YeonView className="rounded-lg border border-[#e5e5e5] bg-white p-3 shadow-[0_8px_24px_rgba(24,24,27,0.04)]">
      <YeonView className="flex items-start justify-between gap-3">
        <YeonView className="min-w-0">
          <YeonText
            as="h3"
            variant="unstyled"
            tone="inherit"
            className={`m-0 text-[15px] font-extrabold leading-[1.35] text-[#18181b] ${
              isDone ? "line-through decoration-[#a1a1aa]" : ""
            }`}
          >
            {task.title}
          </YeonText>
          <YeonView className="mt-2">
            <StatusBadge task={task} />
          </YeonView>
        </YeonView>
        <YeonView className="flex shrink-0 gap-1">
          {task.status === TODO_TASK_STATUSES.inbox ||
          task.status === TODO_TASK_STATUSES.deferred ? (
            <IconButton
              label="오늘로 이동"
              onClick={() => onStatus(task.id, TODO_TASK_STATUSES.planned)}
            >
              <ArrowRight size={16} aria-hidden="true" />
            </IconButton>
          ) : null}
          {task.status === TODO_TASK_STATUSES.planned ? (
            <IconButton
              label="지금 할 일로 지정"
              onClick={() => onStatus(task.id, TODO_TASK_STATUSES.active)}
            >
              <Play size={16} aria-hidden="true" />
            </IconButton>
          ) : null}
          {task.status === TODO_TASK_STATUSES.active ? (
            <IconButton
              label="오늘 목록으로 되돌리기"
              onClick={() => onStatus(task.id, TODO_TASK_STATUSES.planned)}
            >
              <RotateCcw size={16} aria-hidden="true" />
            </IconButton>
          ) : null}
          {!isDone ? (
            <IconButton
              label="완료"
              onClick={() => onStatus(task.id, TODO_TASK_STATUSES.done)}
            >
              <CheckCircle2 size={16} aria-hidden="true" />
            </IconButton>
          ) : (
            <IconButton
              label="오늘 목록으로 복원"
              onClick={() => onStatus(task.id, TODO_TASK_STATUSES.planned)}
            >
              <Circle size={16} aria-hidden="true" />
            </IconButton>
          )}
          {!isDone &&
          task.status !== TODO_TASK_STATUSES.inbox &&
          task.status !== TODO_TASK_STATUSES.deferred ? (
            <IconButton
              label="Inbox로 미루기"
              onClick={() => onStatus(task.id, TODO_TASK_STATUSES.inbox)}
            >
              <Archive size={16} aria-hidden="true" />
            </IconButton>
          ) : null}
          <IconButton
            label="삭제"
            tone="danger"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 size={16} aria-hidden="true" />
          </IconButton>
        </YeonView>
      </YeonView>
      <YeonField
        as="textarea"
        aria-label={`${task.title} 메모`}
        value={task.note}
        onChange={(event) => onNoteChange(task.id, event.target.value)}
        placeholder="짧은 메모"
        rows={2}
        className="mt-3 min-h-16 resize-y rounded-lg border-[#e5e5e5] bg-[#fafafa] text-[13px] leading-[1.5]"
      />
    </YeonView>
  );
}

function TaskColumn({
  title,
  count,
  icon,
  emptyText,
  children,
}: {
  title: string;
  count: number;
  icon: ReactNode;
  emptyText: string;
  children: ReactNode;
}) {
  return (
    <YeonView
      as="section"
      className="min-h-[280px] rounded-xl bg-[#f4f4f5] p-3"
    >
      <YeonView className="mb-3 flex items-center justify-between">
        <YeonView className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#2563eb]">
            {icon}
          </span>
          <YeonText
            as="h2"
            variant="unstyled"
            tone="inherit"
            className="m-0 text-[15px] font-black text-[#18181b]"
          >
            {title}
          </YeonText>
        </YeonView>
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-white px-2 text-[12px] font-black text-[#52525b]"
        >
          {count}
        </YeonText>
      </YeonView>
      <YeonView className="grid gap-2.5">
        {count === 0 ? (
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="rounded-lg border border-dashed border-[#d4d4d8] bg-white px-3 py-6 text-center text-[13px] font-semibold text-[#71717a]"
          >
            {emptyText}
          </YeonText>
        ) : (
          children
        )}
      </YeonView>
    </YeonView>
  );
}

export function TodoServiceScreen() {
  const today = useMemo(() => getTodayServiceLocalDate(), []);
  const [state, setState] = useState<TodoServiceState>(() =>
    parseTodoServiceState(null, today)
  );
  const [hydrated, setHydrated] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TodoTaskPriority>(
    TODO_TASK_PRIORITIES.normal
  );
  const [estimate, setEstimate] = useState<TodoTaskEstimate>(
    TODO_TASK_ESTIMATES.fifteen
  );
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setState(readStoredState(today));
    setHydrated(true);
  }, [today]);

  useEffect(() => {
    if (!hydrated) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setNotice(null);
    } catch {
      setNotice("브라우저 저장소에 저장하지 못했습니다.");
    }
  }, [hydrated, state]);

  const groups = useMemo(
    () => groupTodoTasksForToday(state.tasks, today),
    [state.tasks, today]
  );
  const carryOverCount = useMemo(
    () => countCarryOverTasks(state.tasks, today),
    [state.tasks, today]
  );
  const openTodayCount = countOpenTodayTasks(groups);
  const completionCount = groups.doneToday.length;
  const completionTotal = openTodayCount + completionCount;
  const completionRate =
    completionTotal === 0
      ? 0
      : Math.round((completionCount / completionTotal) * 100);

  function updateTasks(updater: (tasks: TodoTask[]) => TodoTask[]) {
    setState((current) => ({
      ...current,
      lastOpenedDate: today,
      tasks: updater(current.tasks),
    }));
  }

  function handleAddTask(status: Extract<TodoTaskStatus, "inbox" | "planned">) {
    try {
      const task = createTodoTask({
        id: createClientTaskId(),
        title,
        priority,
        estimate,
        today,
        nowIso: getNowIso(),
        status,
      });
      setState((current) => ({
        ...current,
        lastOpenedDate: today,
        tasks: [task, ...current.tasks],
      }));
      setTitle("");
      setNotice(
        status === "planned"
          ? "오늘 목록에 추가했습니다."
          : "Inbox에 추가했습니다."
      );
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "할 일을 추가하지 못했습니다."
      );
    }
  }

  function handleStatus(taskId: string, status: TodoTaskStatus) {
    updateTasks((tasks) =>
      setTodoTaskStatus({
        tasks,
        taskId,
        status,
        today,
        nowIso: getNowIso(),
      })
    );
  }

  function handleCarryOver(mode: "continue" | "inbox") {
    updateTasks((tasks) =>
      carryOverTodoTasks({
        tasks,
        mode,
        today,
        nowIso: getNowIso(),
      })
    );
  }

  function handleDelete(taskId: string) {
    updateTasks((tasks) => removeTodoTask(tasks, taskId));
  }

  function handleNoteChange(taskId: string, note: string) {
    updateTasks((tasks) =>
      updateTodoTaskNote({ tasks, taskId, note, nowIso: getNowIso() })
    );
  }

  return (
    <YeonView className="min-h-screen bg-[#fafafa] text-[#18181b]">
      <CommonProductHeader
        activeService="todo"
        showBgmButton={false}
        showSettingsButton={false}
      />
      <YeonView
        as="main"
        className="mx-auto grid max-w-7xl gap-5 px-4 py-5 md:px-6"
      >
        <YeonView className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <YeonView>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="mb-2 flex items-center gap-2 text-[13px] font-bold text-[#2563eb]"
            >
              <CalendarDays size={16} aria-hidden="true" />
              {formatTodayLabel(today)}
            </YeonText>
            <YeonText
              as="h1"
              variant="unstyled"
              tone="inherit"
              className="m-0 text-[30px] font-black leading-[1.1] tracking-[0] text-[#09090b] md:text-[40px]"
            >
              오늘 할 일만 남기는 보드
            </YeonText>
            <YeonText
              variant="unstyled"
              tone="inherit"
              className="mt-3 max-w-2xl text-[15px] leading-[1.7] text-[#52525b]"
            >
              생각나는 일은 Inbox에 두고, 오늘 끝낼 일만 Today에 올립니다. 지금
              할 일은 하나만 활성화됩니다.
            </YeonText>
          </YeonView>

          <YeonView className="grid grid-cols-3 gap-2 rounded-xl border border-[#e5e5e5] bg-white p-3">
            {[
              ["진행", openTodayCount],
              ["완료", completionCount],
              ["완료율", `${completionRate}%`],
            ].map(([label, value]) => (
              <YeonView key={label} className="rounded-lg bg-[#fafafa] p-3">
                <YeonText
                  variant="unstyled"
                  tone="inherit"
                  className="text-[12px] font-bold text-[#71717a]"
                >
                  {label}
                </YeonText>
                <YeonText
                  variant="unstyled"
                  tone="inherit"
                  className="mt-1 text-[24px] font-black text-[#18181b]"
                >
                  {value}
                </YeonText>
              </YeonView>
            ))}
          </YeonView>
        </YeonView>

        <form
          className="grid gap-3 rounded-xl border border-[#e5e5e5] bg-white p-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
          onSubmit={(event) => {
            event.preventDefault();
            handleAddTask(TODO_TASK_STATUSES.planned);
          }}
        >
          <YeonView className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center">
            <YeonField
              aria-label="새 할 일"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="예: Cloudflare todo 도메인 smoke 확인"
              className="h-11 rounded-lg border-[#d4d4d8] bg-[#fafafa] text-[14px] font-semibold"
            />
            <YeonView className="flex flex-wrap gap-1">
              {PRIORITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPriority(option.value)}
                  className={`h-9 cursor-pointer rounded-lg border px-3 text-[12px] font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2 ${
                    priority === option.value
                      ? "border-[#2563eb] bg-[#eff6ff] text-[#1d4ed8]"
                      : "border-[#e5e5e5] bg-white text-[#52525b] hover:border-[#a1a1aa]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </YeonView>
            <YeonView className="flex flex-wrap gap-1">
              {ESTIMATE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setEstimate(option.value)}
                  className={`h-9 cursor-pointer rounded-lg border px-3 text-[12px] font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2 ${
                    estimate === option.value
                      ? "border-[#18181b] bg-[#18181b] text-white"
                      : "border-[#e5e5e5] bg-white text-[#52525b] hover:border-[#a1a1aa]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </YeonView>
          </YeonView>
          <YeonView className="flex flex-wrap gap-2">
            <YeonButton type="submit" variant="primary" className="h-11 gap-2">
              <Plus size={16} aria-hidden="true" />
              오늘 추가
            </YeonButton>
            <YeonButton
              type="button"
              variant="secondary"
              className="h-11 gap-2"
              onClick={() => handleAddTask(TODO_TASK_STATUSES.inbox)}
            >
              <Inbox size={16} aria-hidden="true" />
              Inbox
            </YeonButton>
          </YeonView>
        </form>

        {notice ? (
          <YeonText
            role="status"
            variant="unstyled"
            tone="inherit"
            className="rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-3 py-2 text-[13px] font-bold text-[#1d4ed8]"
          >
            {notice}
          </YeonText>
        ) : null}

        {carryOverCount > 0 ? (
          <YeonView className="flex flex-col gap-3 rounded-xl border border-[#fde68a] bg-[#fffbeb] p-3 md:flex-row md:items-center md:justify-between">
            <YeonText
              variant="unstyled"
              tone="inherit"
              className="text-[14px] font-bold text-[#92400e]"
            >
              이전 날짜에 남은 일 {carryOverCount}개가 있습니다.
            </YeonText>
            <YeonView className="flex flex-wrap gap-2">
              <YeonButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleCarryOver("continue")}
              >
                오늘로 계속
              </YeonButton>
              <YeonButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleCarryOver("inbox")}
              >
                Inbox로 미루기
              </YeonButton>
            </YeonView>
          </YeonView>
        ) : null}

        <YeonView className="rounded-xl border border-[#dbeafe] bg-[#eff6ff] p-4">
          <YeonView className="mb-3 flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#2563eb]">
              <Play size={18} aria-hidden="true" />
            </span>
            <YeonText
              as="h2"
              variant="unstyled"
              tone="inherit"
              className="m-0 text-[16px] font-black text-[#1e3a8a]"
            >
              지금 할 일
            </YeonText>
          </YeonView>
          {groups.active ? (
            <TaskCard
              task={groups.active}
              onStatus={handleStatus}
              onDelete={handleDelete}
              onNoteChange={handleNoteChange}
            />
          ) : (
            <YeonText
              variant="unstyled"
              tone="inherit"
              className="rounded-lg border border-dashed border-[#bfdbfe] bg-white px-3 py-5 text-center text-[14px] font-bold text-[#2563eb]"
            >
              Today 목록에서 재생 버튼을 눌러 하나만 집중하세요.
            </YeonText>
          )}
        </YeonView>

        <YeonView className="grid gap-3 lg:grid-cols-3">
          <TaskColumn
            title={`Today ${openTodayCount > TODAY_LIMIT ? "· 줄이기 권장" : ""}`}
            count={groups.planned.length}
            icon={<ListTodo size={17} aria-hidden="true" />}
            emptyText="오늘 확정한 일이 없습니다."
          >
            {groups.planned.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatus={handleStatus}
                onDelete={handleDelete}
                onNoteChange={handleNoteChange}
              />
            ))}
          </TaskColumn>
          <TaskColumn
            title="Inbox"
            count={groups.inbox.length}
            icon={<Inbox size={17} aria-hidden="true" />}
            emptyText="나중에 볼 일이 없습니다."
          >
            {groups.inbox.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatus={handleStatus}
                onDelete={handleDelete}
                onNoteChange={handleNoteChange}
              />
            ))}
          </TaskColumn>
          <TaskColumn
            title="Done"
            count={groups.doneToday.length}
            icon={<CheckCircle2 size={17} aria-hidden="true" />}
            emptyText="아직 오늘 완료한 일이 없습니다."
          >
            {groups.doneToday.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatus={handleStatus}
                onDelete={handleDelete}
                onNoteChange={handleNoteChange}
              />
            ))}
          </TaskColumn>
        </YeonView>
      </YeonView>
    </YeonView>
  );
}
