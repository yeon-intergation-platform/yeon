"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Archive,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Inbox,
  Info,
  Lightbulb,
  ListTodo,
  MoreVertical,
  Play,
  Plus,
  RotateCcw,
  Settings,
  Star,
  Timer,
  Trash2,
} from "lucide-react";
import { YeonButton, YeonField, YeonText, YeonView } from "@yeon/ui";
import { CommonProductHeader } from "@/components/product-shell/product-header";
import {
  createStudyDeskTodoSearch,
  resolveCardStudyDeskHref,
} from "@/lib/study-desk-links";
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
  countOpenTodayTasks,
  createTodoTask,
  getTodayServiceLocalDate,
  getTodoTaskEstimateMinutes,
  groupTodoTasksForToday,
  parseTodoServiceState,
  removeTodoTask,
  setTodoTaskStatus,
  updateTodoTaskNote,
  type TodoCalendarDaySummary,
  type TodoServiceState,
  type TodoTask,
  type TodoTaskEstimate,
  type TodoTaskPriority,
  type TodoTaskRecommendation,
  type TodoTaskStatus,
} from "./todo-service-model";

const STORAGE_KEY = "yeon.todo-service.state.v1";
const TODAY_LIMIT = 5;
const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
const BOARD_SURFACE_CLASS = "rounded-lg border border-[#e5e5e5] bg-white";
const MUTED_TEXT_CLASS = "text-[#666]";
const SUBTLE_TEXT_CLASS = "text-[#aaa]";
const FOCUS_CLASS =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111] focus-visible:ring-offset-2";

type TodoPriorityFilter = "all" | TodoTaskPriority;
type TodoEstimateFilter = "all" | TodoTaskEstimate;

const PRIORITY_OPTIONS: { value: TodoTaskPriority; label: string }[] = [
  { value: TODO_TASK_PRIORITIES.important, label: "높음" },
  { value: TODO_TASK_PRIORITIES.normal, label: "보통" },
  { value: TODO_TASK_PRIORITIES.light, label: "낮음" },
];

const PRIORITY_FILTER_OPTIONS: { value: TodoPriorityFilter; label: string }[] =
  [{ value: "all", label: "전체" }, ...PRIORITY_OPTIONS];

const ESTIMATE_META: Record<TodoTaskEstimate, { label: string }> = {
  [TODO_TASK_ESTIMATES.five]: { label: "5분" },
  [TODO_TASK_ESTIMATES.fifteen]: { label: "15분" },
  [TODO_TASK_ESTIMATES.thirty]: { label: "30분" },
  [TODO_TASK_ESTIMATES.hour]: { label: "1시간" },
  [TODO_TASK_ESTIMATES.twoHours]: { label: "2시간+" },
};

const CREATE_ESTIMATE_OPTIONS: { value: TodoTaskEstimate; label: string }[] = [
  { value: TODO_TASK_ESTIMATES.fifteen, label: "15분" },
  { value: TODO_TASK_ESTIMATES.thirty, label: "30분" },
  { value: TODO_TASK_ESTIMATES.hour, label: "1시간" },
  { value: TODO_TASK_ESTIMATES.twoHours, label: "2시간+" },
];

const ESTIMATE_FILTER_OPTIONS: { value: TodoEstimateFilter; label: string }[] =
  [{ value: "all", label: "전체" }, ...CREATE_ESTIMATE_OPTIONS];

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

function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${date}T00:00:00`));
}

function formatMonthLabel(date: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
  }).format(new Date(`${date.slice(0, 7)}-01T00:00:00`));
}

function getDayNumber(date: string) {
  return Number(date.slice(-2));
}

function isIsoDateInputValue(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function getPriorityLabel(priority: TodoTaskPriority) {
  return (
    PRIORITY_OPTIONS.find((option) => option.value === priority)?.label ??
    "보통"
  );
}

function getEstimateLabel(estimate: TodoTaskEstimate) {
  return ESTIMATE_META[estimate]?.label ?? estimate;
}

function getTaskMinuteSummary(tasks: readonly TodoTask[]) {
  const totalMinutes = tasks.reduce(
    (sum, task) => sum + getTodoTaskEstimateMinutes(task.estimate),
    0
  );
  if (totalMinutes < 60) return `예상 ${totalMinutes}분`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes === 0 ? `예상 ${hours}h` : `예상 ${hours}h ${minutes}m`;
}

function resolveStudyDeskTaskUrl(task: TodoTask) {
  const search = createStudyDeskTodoSearch({
    todoTaskId: task.id,
    todoTitle: task.title,
  });
  return resolveCardStudyDeskHref({ search });
}

function matchesBoardFilters({
  task,
  priorityFilter,
  estimateFilter,
}: {
  task: TodoTask;
  priorityFilter: TodoPriorityFilter;
  estimateFilter: TodoEstimateFilter;
}) {
  const priorityMatches =
    priorityFilter === "all" || task.priority === priorityFilter;
  const estimateMatches =
    estimateFilter === "all" || task.estimate === estimateFilter;
  return priorityMatches && estimateMatches;
}

function IconButton({
  label,
  onClick,
  children,
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#e5e5e5] bg-white text-[#111] transition-colors hover:bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS_CLASS}`}
    >
      {children}
    </button>
  );
}

function SegmentButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`h-9 cursor-pointer rounded-lg border px-4 text-[12px] font-bold transition-colors ${FOCUS_CLASS} ${
        selected
          ? "border-[#111] bg-[#111] text-white"
          : "border-[#e5e5e5] bg-white text-[#111] hover:bg-[#fafafa]"
      }`}
    >
      {children}
    </button>
  );
}

function StatusBadge({ task }: { task: TodoTask }) {
  return (
    <YeonView className="flex flex-wrap items-center gap-1.5">
      <YeonText
        as="span"
        variant="unstyled"
        tone="inherit"
        className="inline-flex h-6 items-center rounded-full border border-[#e5e5e5] bg-[#fafafa] px-2 text-[11px] font-bold text-[#111]"
      >
        {getPriorityLabel(task.priority)}
      </YeonText>
      <YeonText
        as="span"
        variant="unstyled"
        tone="inherit"
        className="inline-flex h-6 items-center rounded-full border border-[#e5e5e5] bg-white px-2 text-[11px] font-bold text-[#666]"
      >
        {getEstimateLabel(task.estimate)}
      </YeonText>
      {task.note.trim() ? (
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className="inline-flex h-6 items-center rounded-full border border-[#e5e5e5] bg-white px-2 text-[11px] font-bold text-[#666]"
        >
          메모 있음
        </YeonText>
      ) : null}
    </YeonView>
  );
}

function TaskBenefitScore({ task }: { task: TodoTask }) {
  const score = calculateTodoTaskBenefitScore(task);

  return (
    <YeonView className="mt-3 grid gap-1">
      <YeonView className="flex items-center gap-2">
        <YeonText
          variant="unstyled"
          tone="inherit"
          className="text-[12px] font-bold text-[#666]"
        >
          이득 점수
        </YeonText>
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className="text-[16px] font-black text-[#111]"
        >
          {score}점
        </YeonText>
      </YeonView>
      <YeonView className="h-1.5 overflow-hidden rounded-full bg-[#e5e5e5]">
        <span
          className="block h-full rounded-full bg-[#111]"
          style={{ width: `${score}%` }}
        />
      </YeonView>
    </YeonView>
  );
}

function TaskCard({
  task,
  onStatus,
  onDelete,
  onNoteChange,
  onMoveNextDay,
  onOpenStudyDesk,
  showNoteEditor = true,
  showScore = false,
}: {
  task: TodoTask;
  onStatus: (taskId: string, status: TodoTaskStatus) => void;
  onDelete: (taskId: string) => void;
  onNoteChange: (taskId: string, note: string) => void;
  onMoveNextDay: (taskId: string) => void;
  onOpenStudyDesk: (task: TodoTask) => void;
  showNoteEditor?: boolean;
  showScore?: boolean;
}) {
  const isDone = task.status === TODO_TASK_STATUSES.done;

  return (
    <YeonView className={`${BOARD_SURFACE_CLASS} p-3 shadow-sm`}>
      <YeonView className="flex items-start justify-between gap-3">
        <YeonView className="min-w-0">
          <YeonText
            as="h3"
            variant="unstyled"
            tone="inherit"
            className={`m-0 text-[15px] font-black leading-[1.35] text-[#111] ${
              isDone ? "line-through decoration-[#aaa]" : ""
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
              label="선택 날짜로 이동"
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
              label="선택 날짜 목록으로 되돌리기"
              onClick={() => onStatus(task.id, TODO_TASK_STATUSES.planned)}
            >
              <RotateCcw size={16} aria-hidden="true" />
            </IconButton>
          ) : null}
          {!isDone ? (
            <IconButton
              label="Study Desk로 집중 시작"
              onClick={() => onOpenStudyDesk(task)}
            >
              <Timer size={16} aria-hidden="true" />
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
              label="선택 날짜 목록으로 복원"
              onClick={() => onStatus(task.id, TODO_TASK_STATUSES.planned)}
            >
              <Circle size={16} aria-hidden="true" />
            </IconButton>
          )}
          {!isDone &&
          task.status !== TODO_TASK_STATUSES.inbox &&
          task.status !== TODO_TASK_STATUSES.deferred ? (
            <IconButton
              label="내일로 미루기"
              onClick={() => onMoveNextDay(task.id)}
            >
              <Archive size={16} aria-hidden="true" />
            </IconButton>
          ) : null}
          <IconButton label="삭제" onClick={() => onDelete(task.id)}>
            <Trash2 size={16} aria-hidden="true" />
          </IconButton>
        </YeonView>
      </YeonView>
      {showScore ? <TaskBenefitScore task={task} /> : null}
      {showNoteEditor ? (
        <YeonField
          as="textarea"
          aria-label={`${task.title} 메모`}
          value={task.note}
          onChange={(event) => onNoteChange(task.id, event.target.value)}
          placeholder="짧은 메모"
          rows={2}
          className="mt-3 min-h-16 resize-y rounded-lg bg-[#fafafa] text-[13px] leading-[1.5]"
        />
      ) : null}
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
      className="min-h-[320px] rounded-lg bg-[#fafafa] p-3"
    >
      <YeonView className="mb-3 flex items-center justify-between">
        <YeonView className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5e5e5] bg-white text-[#111]">
            {icon}
          </span>
          <YeonText
            as="h2"
            variant="unstyled"
            tone="inherit"
            className="m-0 text-[15px] font-black text-[#111]"
          >
            {title}
          </YeonText>
        </YeonView>
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-white px-2 text-[12px] font-black text-[#111]"
        >
          {count}
        </YeonText>
      </YeonView>
      <YeonView className="grid gap-2.5">
        {count === 0 ? (
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="rounded-lg border border-dashed border-[#e5e5e5] bg-white px-3 py-6 text-center text-[13px] font-semibold text-[#666]"
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

function DateNavigator({
  selectedDate,
  actualToday,
  onSelectDate,
  onMoveDate,
}: {
  selectedDate: string;
  actualToday: string;
  onSelectDate: (date: string) => void;
  onMoveDate: (amount: number) => void;
}) {
  const isTodaySelected = selectedDate === actualToday;

  return (
    <YeonView className={`${BOARD_SURFACE_CLASS} grid gap-2 p-3`}>
      <YeonView className="flex items-center justify-between gap-2">
        <YeonText
          variant="unstyled"
          tone="inherit"
          className="text-[12px] font-black tracking-[0] text-[#666]"
        >
          날짜 이동
        </YeonText>
        <YeonButton
          type="button"
          variant={isTodaySelected ? "ghost" : "secondary"}
          size="sm"
          onClick={() => onSelectDate(actualToday)}
          disabled={isTodaySelected}
        >
          오늘
        </YeonButton>
      </YeonView>
      <YeonView className="grid grid-cols-[40px_minmax(0,1fr)_40px] gap-2">
        <IconButton label="이전 날짜" onClick={() => onMoveDate(-1)}>
          <ChevronLeft size={16} aria-hidden="true" />
        </IconButton>
        <YeonField
          type="date"
          aria-label="선택 날짜"
          value={selectedDate}
          onChange={(event) => {
            if (isIsoDateInputValue(event.target.value)) {
              onSelectDate(event.target.value);
            }
          }}
          className="h-10 rounded-lg bg-[#fafafa] text-center text-[14px] font-bold"
        />
        <IconButton label="다음 날짜" onClick={() => onMoveDate(1)}>
          <ChevronRight size={16} aria-hidden="true" />
        </IconButton>
      </YeonView>
    </YeonView>
  );
}

function CalendarPanel({
  days,
  visibleDate,
  selectedDate,
  onSelectDate,
  onMoveMonth,
}: {
  days: readonly TodoCalendarDaySummary[];
  visibleDate: string;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onMoveMonth: (amount: number) => void;
}) {
  return (
    <YeonView as="section" className={`${BOARD_SURFACE_CLASS} p-4`}>
      <YeonView className="mb-3 flex items-center justify-between gap-2">
        <YeonView>
          <YeonText
            as="h2"
            variant="unstyled"
            tone="inherit"
            className="m-0 text-[16px] font-black text-[#111]"
          >
            월간 전체보기
          </YeonText>
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="mt-1 text-[12px] font-semibold text-[#666]"
          >
            {formatMonthLabel(visibleDate)}
          </YeonText>
        </YeonView>
        <YeonView className="flex gap-1">
          <IconButton label="이전 달" onClick={() => onMoveMonth(-1)}>
            <ChevronLeft size={16} aria-hidden="true" />
          </IconButton>
          <IconButton label="다음 달" onClick={() => onMoveMonth(1)}>
            <ChevronRight size={16} aria-hidden="true" />
          </IconButton>
        </YeonView>
      </YeonView>

      <YeonView className="mb-1 grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((label) => (
          <YeonText
            key={label}
            variant="unstyled"
            tone="inherit"
            className="py-1 text-center text-[11px] font-black text-[#666]"
          >
            {label}
          </YeonText>
        ))}
      </YeonView>

      <YeonView className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const hasWork = day.totalCount > 0;
          return (
            <button
              key={day.date}
              type="button"
              aria-pressed={day.date === selectedDate}
              aria-label={`${day.date} 선택, 남은 일 ${day.openCount}개, 완료 ${day.doneCount}개`}
              onClick={() => onSelectDate(day.date)}
              className={`min-h-[58px] cursor-pointer rounded-lg border p-1.5 text-left transition-colors ${FOCUS_CLASS} ${
                day.isSelected
                  ? "border-[#111] bg-[#fafafa] text-[#111]"
                  : hasWork
                    ? "border-[#e5e5e5] bg-[#fafafa] text-[#111] hover:border-[#111]"
                    : "border-[#e5e5e5] bg-white text-[#666] hover:bg-[#fafafa]"
              } ${day.isInVisibleMonth ? "" : "opacity-45"}`}
            >
              <span className="flex items-center justify-between gap-1">
                <span className="text-[12px] font-black">
                  {getDayNumber(day.date)}
                </span>
                {day.isToday ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#111]" />
                ) : null}
              </span>
              {hasWork ? (
                <span className="mt-2 grid gap-1 text-[10px] font-black leading-none">
                  {day.openCount > 0 ? (
                    <span className="rounded-full border border-[#e5e5e5] bg-white px-1.5 py-1 text-[#111]">
                      남 {day.openCount}
                    </span>
                  ) : null}
                  {day.doneCount > 0 ? (
                    <span className="rounded-full border border-[#e5e5e5] bg-white px-1.5 py-1 text-[#666]">
                      완 {day.doneCount}
                    </span>
                  ) : null}
                </span>
              ) : null}
            </button>
          );
        })}
      </YeonView>

      <YeonView className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold text-[#666]">
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[#111]" />
          오늘
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[#e5e5e5]" />
          남은 일
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full border border-[#e5e5e5] bg-white" />
          완료
        </span>
      </YeonView>
    </YeonView>
  );
}

function ActiveTaskPanel({
  activeTask,
  topRecommendation,
  onStart,
  onComplete,
  onOpenStudyDesk,
}: {
  activeTask: TodoTask | null;
  topRecommendation: TodoTaskRecommendation | undefined;
  onStart: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  onOpenStudyDesk: (task: TodoTask) => void;
}) {
  const task = activeTask ?? topRecommendation?.task ?? null;

  return (
    <YeonView className={`${BOARD_SURFACE_CLASS} bg-[#fafafa] p-4`}>
      <YeonView className="mb-3 flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5e5e5] bg-white text-[#111]">
          <Play size={17} aria-hidden="true" />
        </span>
        <YeonText
          as="h2"
          variant="unstyled"
          tone="inherit"
          className="m-0 text-[17px] font-black text-[#111]"
        >
          지금 할 일
        </YeonText>
      </YeonView>
      {task ? (
        <YeonView className={`${BOARD_SURFACE_CLASS} p-3`}>
          <YeonView className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <YeonView className="min-w-0">
              <YeonView className="mb-2 flex flex-wrap items-center gap-2">
                {activeTask ? null : (
                  <YeonText
                    as="span"
                    variant="unstyled"
                    tone="inherit"
                    className="inline-flex h-6 items-center rounded-full border border-[#e5e5e5] bg-white px-2 text-[11px] font-black text-[#111]"
                  >
                    추천
                  </YeonText>
                )}
                <StatusBadge task={task} />
              </YeonView>
              <YeonText
                as="h3"
                variant="unstyled"
                tone="inherit"
                className="m-0 text-[16px] font-black text-[#111]"
              >
                {task.title}
              </YeonText>
              <YeonText
                variant="unstyled"
                tone="inherit"
                className={`mt-2 text-[12px] font-semibold ${MUTED_TEXT_CLASS}`}
              >
                이득 점수 {calculateTodoTaskBenefitScore(task)}점
              </YeonText>
            </YeonView>
            <YeonView className="flex shrink-0 flex-wrap gap-2">
              <YeonButton
                type="button"
                variant="secondary"
                className="h-11 gap-2"
                onClick={() => onOpenStudyDesk(task)}
              >
                작업대
                <Timer size={15} aria-hidden="true" />
              </YeonButton>
              <YeonButton
                type="button"
                variant="primary"
                className="h-11 gap-2"
                onClick={() =>
                  activeTask ? onComplete(task.id) : onStart(task.id)
                }
              >
                {activeTask ? "완료 처리" : "이 task 시작하기"}
                <Play size={15} aria-hidden="true" />
              </YeonButton>
            </YeonView>
          </YeonView>
        </YeonView>
      ) : (
        <YeonText
          variant="unstyled"
          tone="inherit"
          className="rounded-lg border border-dashed border-[#e5e5e5] bg-white px-3 py-5 text-center text-[14px] font-bold text-[#666]"
        >
          선택 날짜 목록에 일을 추가하면 바로 시작할 task를 추천합니다.
        </YeonText>
      )}
    </YeonView>
  );
}

function RecommendationPanel({
  recommendations,
  onStart,
  onMoveNextDay,
  onDone,
  onShowMore,
}: {
  recommendations: readonly TodoTaskRecommendation[];
  onStart: (taskId: string) => void;
  onMoveNextDay: (taskId: string) => void;
  onDone: (taskId: string) => void;
  onShowMore: () => void;
}) {
  const hasRecommendations = Boolean(recommendations[0]);

  return (
    <YeonView className={`${BOARD_SURFACE_CLASS} bg-[#fafafa] p-4`}>
      <YeonView className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <YeonView className="flex items-center gap-2">
          <YeonText
            as="h2"
            variant="unstyled"
            tone="inherit"
            className="m-0 text-[16px] font-black text-[#111]"
          >
            먼저 하면 개이득인 일 {recommendations.length}개
          </YeonText>
          <Info size={15} aria-hidden="true" className="text-[#666]" />
        </YeonView>
        <YeonButton
          type="button"
          variant="secondary"
          size="sm"
          disabled={!hasRecommendations}
          onClick={onShowMore}
        >
          <Settings size={14} aria-hidden="true" />
          설정
        </YeonButton>
      </YeonView>
      {!hasRecommendations ? (
        <YeonText
          variant="unstyled"
          tone="inherit"
          className="rounded-lg border border-dashed border-[#e5e5e5] bg-white px-3 py-6 text-center text-[13px] font-semibold text-[#666]"
        >
          추천할 선택 날짜 일이 없습니다.
        </YeonText>
      ) : (
        <YeonView className="grid gap-3 lg:grid-cols-3">
          {recommendations.map(({ task, rank, score }) => (
            <YeonView
              key={task.id}
              className={`${BOARD_SURFACE_CLASS} relative overflow-hidden p-3 shadow-sm`}
            >
              <span className="absolute left-0 top-0 inline-flex h-9 w-9 items-center justify-center rounded-br-lg bg-[#111] text-[13px] font-black text-white">
                {rank}
              </span>
              <YeonView className="ml-8 flex items-start justify-between gap-2">
                <YeonText
                  as="h3"
                  variant="unstyled"
                  tone="inherit"
                  className="m-0 line-clamp-2 text-[14px] font-black leading-[1.35] text-[#111]"
                >
                  {task.title}
                </YeonText>
                <Star size={16} aria-hidden="true" className="shrink-0" />
              </YeonView>
              <YeonView className="mt-3">
                <StatusBadge task={task} />
              </YeonView>
              <YeonView className="mt-3 grid gap-1">
                <YeonText
                  variant="unstyled"
                  tone="inherit"
                  className="text-[12px] font-bold text-[#666]"
                >
                  이득 점수{" "}
                  <span className="text-[16px] font-black text-[#111]">
                    {score}점
                  </span>
                </YeonText>
                <YeonView className="h-1.5 overflow-hidden rounded-full bg-[#e5e5e5]">
                  <span
                    className="block h-full rounded-full bg-[#111]"
                    style={{ width: `${score}%` }}
                  />
                </YeonView>
              </YeonView>
              <YeonView className="mt-4 grid grid-cols-3 gap-2">
                <YeonButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => onStart(task.id)}
                >
                  <Play size={13} aria-hidden="true" />
                  시작
                </YeonButton>
                <YeonButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => onMoveNextDay(task.id)}
                >
                  미루기
                </YeonButton>
                <YeonButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => onDone(task.id)}
                >
                  완료
                </YeonButton>
              </YeonView>
            </YeonView>
          ))}
        </YeonView>
      )}
      {hasRecommendations ? (
        <button
          type="button"
          onClick={onShowMore}
          className={`mt-3 text-[12px] font-bold text-[#666] underline underline-offset-4 hover:text-[#111] ${FOCUS_CLASS}`}
        >
          더 추천 보기
        </button>
      ) : null}
    </YeonView>
  );
}

function PrioritySuggestionPanel({
  lowPriorityCount,
  onMoveLowPriority,
  onShowRecommendations,
}: {
  lowPriorityCount: number;
  onMoveLowPriority: () => void;
  onShowRecommendations: () => void;
}) {
  return (
    <YeonView className={`${BOARD_SURFACE_CLASS} p-4`}>
      <YeonView className="mb-3 flex items-center gap-2">
        <Lightbulb size={19} aria-hidden="true" />
        <YeonText
          as="h2"
          variant="unstyled"
          tone="inherit"
          className="m-0 text-[16px] font-black text-[#111]"
        >
          우선 정리 추천
        </YeonText>
      </YeonView>
      <YeonView className="grid gap-2">
        <button
          type="button"
          onClick={onMoveLowPriority}
          disabled={lowPriorityCount === 0}
          className={`${BOARD_SURFACE_CLASS} flex min-h-16 items-center justify-between gap-3 p-3 text-left text-[#111] transition-colors hover:bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS_CLASS}`}
        >
          <span className="text-[14px] font-bold">
            {lowPriorityCount > 0
              ? `낮은 우선순위 ${lowPriorityCount}개는 내일로 미루기`
              : "내일로 미룰 낮은 우선순위 일이 없습니다"}
          </span>
          <ChevronRight size={17} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onShowRecommendations}
          className={`${BOARD_SURFACE_CLASS} flex min-h-12 items-center justify-between gap-3 p-3 text-left text-[#111] transition-colors hover:bg-[#fafafa] ${FOCUS_CLASS}`}
        >
          <span className="text-[14px] font-bold">추천 목록 보기</span>
          <ChevronRight size={17} aria-hidden="true" />
        </button>
      </YeonView>
    </YeonView>
  );
}

export function TodoServiceScreen() {
  const actualToday = useMemo(() => getTodayServiceLocalDate(), []);
  const [selectedDate, setSelectedDate] = useState(actualToday);
  const [visibleDate, setVisibleDate] = useState(actualToday);
  const [state, setState] = useState<TodoServiceState>(() =>
    parseTodoServiceState(null, actualToday)
  );
  const [hydrated, setHydrated] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TodoTaskPriority>(
    TODO_TASK_PRIORITIES.normal
  );
  const [estimate, setEstimate] = useState<TodoTaskEstimate>(
    TODO_TASK_ESTIMATES.fifteen
  );
  const [priorityFilter, setPriorityFilter] =
    useState<TodoPriorityFilter>("all");
  const [estimateFilter, setEstimateFilter] =
    useState<TodoEstimateFilter>("all");
  const [recommendationLimit, setRecommendationLimit] = useState(3);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setState(readStoredState(actualToday));
    setHydrated(true);
  }, [actualToday]);

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
    () => groupTodoTasksForToday(state.tasks, selectedDate),
    [state.tasks, selectedDate]
  );
  const carryOverCount = useMemo(
    () => countCarryOverTasks(state.tasks, actualToday),
    [state.tasks, actualToday]
  );
  const calendarDays = useMemo(
    () =>
      buildTodoServiceCalendarMonth({
        tasks: state.tasks,
        visibleDate,
        selectedDate,
        today: actualToday,
      }),
    [actualToday, selectedDate, state.tasks, visibleDate]
  );

  const openSelectedDateCount = countOpenTodayTasks(groups);
  const completionCount = groups.doneToday.length;
  const completionTotal = openSelectedDateCount + completionCount;
  const completionRate =
    completionTotal === 0
      ? 0
      : Math.round((completionCount / completionTotal) * 100);
  const selectedDateTasks = [
    ...(groups.active ? [groups.active] : []),
    ...groups.planned,
  ];
  const filteredPlannedTasks = groups.planned.filter((task) =>
    matchesBoardFilters({ task, priorityFilter, estimateFilter })
  );
  const filteredRecommendationTasks = groups.planned.filter((task) =>
    matchesBoardFilters({ task, priorityFilter, estimateFilter })
  );
  const recommendations = buildTodoTaskRecommendations(
    filteredRecommendationTasks,
    recommendationLimit
  );
  const lowPriorityTasks = groups.planned.filter(
    (task) => task.priority === TODO_TASK_PRIORITIES.light
  );

  function updateTasks(updater: (tasks: TodoTask[]) => TodoTask[]) {
    setState((current) => ({
      ...current,
      lastOpenedDate: actualToday,
      tasks: updater(current.tasks),
    }));
  }

  function handleSelectDate(date: string) {
    setSelectedDate(date);
    setVisibleDate(date);
  }

  function handleMoveDate(amount: number) {
    handleSelectDate(addTodoServiceDays(selectedDate, amount));
  }

  function handleMoveMonth(amount: number) {
    setVisibleDate((current) => addTodoServiceMonths(current, amount));
  }

  function handleAddTask(status: Extract<TodoTaskStatus, "inbox" | "planned">) {
    try {
      const task = createTodoTask({
        id: createClientTaskId(),
        title,
        priority,
        estimate,
        today: selectedDate,
        nowIso: getNowIso(),
        status,
      });
      setState((current) => ({
        ...current,
        lastOpenedDate: actualToday,
        tasks: [task, ...current.tasks],
      }));
      setTitle("");
      setNotice(
        status === "planned"
          ? `${formatDateLabel(selectedDate)} 목록에 추가했습니다.`
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
        today: selectedDate,
        nowIso: getNowIso(),
      })
    );
  }

  function handleMoveTaskToNextDay(taskId: string) {
    const nextDate = addTodoServiceDays(selectedDate, 1);
    updateTasks((tasks) =>
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: TODO_TASK_STATUSES.planned,
              plannedFor: nextDate,
              completedAt: null,
              completedOn: null,
              updatedAt: getNowIso(),
            }
          : task
      )
    );
    setNotice("내일 목록으로 미뤘습니다.");
  }

  function handleMoveLowPriorityTasks() {
    const targetIds = new Set(lowPriorityTasks.map((task) => task.id));
    const nextDate = addTodoServiceDays(selectedDate, 1);
    updateTasks((tasks) =>
      tasks.map((task) =>
        targetIds.has(task.id)
          ? {
              ...task,
              status: TODO_TASK_STATUSES.planned,
              plannedFor: nextDate,
              completedAt: null,
              completedOn: null,
              updatedAt: getNowIso(),
            }
          : task
      )
    );
    setNotice(`낮은 우선순위 ${targetIds.size}개를 내일로 미뤘습니다.`);
  }

  function handleCarryOver(mode: "continue" | "inbox") {
    updateTasks((tasks) =>
      carryOverTodoTasks({
        tasks,
        mode,
        today: actualToday,
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

  function handleOpenStudyDesk(task: TodoTask) {
    window.location.assign(resolveStudyDeskTaskUrl(task));
  }

  return (
    <YeonView className="min-h-screen bg-[#fafafa] text-[#111]">
      <CommonProductHeader
        activeService="todo"
        showBgmButton={false}
        showSettingsButton={false}
      />
      <YeonView
        as="main"
        className="mx-auto grid max-w-[1500px] gap-5 px-4 py-5 md:px-6"
      >
        <YeonView className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px]">
          <YeonView>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="mb-2 flex items-center gap-2 text-[13px] font-bold text-[#111]"
            >
              <CalendarDays size={16} aria-hidden="true" />
              {formatDateLabel(selectedDate)}
            </YeonText>
            <YeonText
              as="h1"
              variant="unstyled"
              tone="inherit"
              className="m-0 text-[30px] font-black leading-[1.1] tracking-[0] text-[#111] md:text-[40px]"
            >
              {selectedDate === actualToday
                ? "오늘 할 일만 남기는 보드"
                : "선택 날짜 할 일 보드"}
            </YeonText>
            <YeonText
              variant="unstyled"
              tone="inherit"
              className="mt-3 max-w-2xl text-[15px] leading-[1.7] text-[#666]"
            >
              생각나는 일은 Inbox에 두고,{" "}
              {selectedDate === actualToday
                ? "오늘 끝낼 일만 Today에 올립니다."
                : "선택한 날짜에 끝낼 일만 목록에 올립니다."}{" "}
              지금 할 일은 하나만 활성화됩니다.
            </YeonText>
          </YeonView>

          <YeonView className="grid gap-3">
            <DateNavigator
              selectedDate={selectedDate}
              actualToday={actualToday}
              onSelectDate={handleSelectDate}
              onMoveDate={handleMoveDate}
            />
            <YeonView className={`${BOARD_SURFACE_CLASS} grid grid-cols-3 p-3`}>
              {[
                ["진행", openSelectedDateCount],
                ["완료", completionCount],
                ["완료율", `${completionRate}%`],
              ].map(([label, value], index) => (
                <YeonView
                  key={label}
                  className={`px-3 py-2 ${
                    index > 0 ? "border-l border-[#e5e5e5]" : ""
                  }`}
                >
                  <YeonText
                    variant="unstyled"
                    tone="inherit"
                    className="text-[12px] font-bold text-[#666]"
                  >
                    {label}
                  </YeonText>
                  <YeonText
                    variant="unstyled"
                    tone="inherit"
                    className="mt-1 text-[24px] font-black text-[#111]"
                  >
                    {value}
                  </YeonText>
                </YeonView>
              ))}
            </YeonView>
          </YeonView>
        </YeonView>

        <form
          className={`${BOARD_SURFACE_CLASS} grid gap-3 p-3`}
          onSubmit={(event) => {
            event.preventDefault();
            handleAddTask(TODO_TASK_STATUSES.planned);
          }}
        >
          <YeonView className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_220px_auto_auto] lg:items-center">
            <YeonField
              aria-label="새 할 일"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="예: Cloudflare todo 도메인 smoke 확인"
              className="h-11 rounded-lg bg-[#fafafa] text-[14px] font-semibold"
            />
            <YeonButton
              type="submit"
              variant="secondary"
              className="h-11 gap-2"
            >
              <Plus size={15} aria-hidden="true" />
              추가
            </YeonButton>
            <YeonField
              as="select"
              aria-label="우선순위 필터"
              value={priorityFilter}
              onChange={(event) => {
                const nextPriority = event.target.value as TodoPriorityFilter;
                setPriorityFilter(nextPriority);
                if (nextPriority !== "all") {
                  setPriority(nextPriority);
                }
              }}
              className="h-11 rounded-lg bg-white text-[13px] font-bold"
            >
              {PRIORITY_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  우선순위: {option.label}
                </option>
              ))}
            </YeonField>
            <YeonButton type="submit" variant="primary" className="h-11 gap-2">
              <Plus size={16} aria-hidden="true" />
              {selectedDate === actualToday ? "오늘 추가" : "선택 날짜 추가"}
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
          <YeonView className="flex flex-wrap items-center gap-2">
            <YeonText
              variant="unstyled"
              tone="inherit"
              className="mr-1 text-[13px] font-bold text-[#111]"
            >
              우선순위
            </YeonText>
            {PRIORITY_FILTER_OPTIONS.map((option) => (
              <SegmentButton
                key={option.value}
                selected={priorityFilter === option.value}
                onClick={() => {
                  setPriorityFilter(option.value);
                  if (option.value !== "all") {
                    setPriority(option.value);
                  }
                }}
              >
                {option.label}
              </SegmentButton>
            ))}
            <YeonText
              variant="unstyled"
              tone="inherit"
              className="ml-3 mr-1 text-[13px] font-bold text-[#111]"
            >
              예상 시간
            </YeonText>
            {ESTIMATE_FILTER_OPTIONS.map((option) => (
              <SegmentButton
                key={option.value}
                selected={estimateFilter === option.value}
                onClick={() => {
                  setEstimateFilter(option.value);
                  if (option.value !== "all") {
                    setEstimate(option.value);
                  }
                }}
              >
                {option.label}
              </SegmentButton>
            ))}
          </YeonView>
        </form>

        {notice ? (
          <YeonText
            role="status"
            variant="unstyled"
            tone="inherit"
            className={`${BOARD_SURFACE_CLASS} px-3 py-2 text-[13px] font-bold text-[#111]`}
          >
            {notice}
          </YeonText>
        ) : null}

        {selectedDate === actualToday && carryOverCount > 0 ? (
          <YeonView
            className={`${BOARD_SURFACE_CLASS} flex flex-col gap-3 p-3 md:flex-row md:items-center md:justify-between`}
          >
            <YeonText
              variant="unstyled"
              tone="inherit"
              className="text-[14px] font-bold text-[#111]"
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

        <YeonView className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <YeonView className="grid gap-5">
            <ActiveTaskPanel
              activeTask={groups.active}
              topRecommendation={recommendations[0]}
              onStart={(taskId) =>
                handleStatus(taskId, TODO_TASK_STATUSES.active)
              }
              onComplete={(taskId) =>
                handleStatus(taskId, TODO_TASK_STATUSES.done)
              }
              onOpenStudyDesk={handleOpenStudyDesk}
            />

            <RecommendationPanel
              recommendations={recommendations}
              onStart={(taskId) =>
                handleStatus(taskId, TODO_TASK_STATUSES.active)
              }
              onMoveNextDay={handleMoveTaskToNextDay}
              onDone={(taskId) => handleStatus(taskId, TODO_TASK_STATUSES.done)}
              onShowMore={() =>
                setRecommendationLimit((current) =>
                  current >= filteredRecommendationTasks.length
                    ? 3
                    : filteredRecommendationTasks.length
                )
              }
            />

            <YeonView className="grid gap-3 lg:grid-cols-3">
              <TaskColumn
                title={`${selectedDate === actualToday ? "Today" : "선택 날짜"} ${
                  openSelectedDateCount > TODAY_LIMIT ? "· 줄이기 권장" : ""
                }`}
                count={filteredPlannedTasks.length}
                icon={<ListTodo size={17} aria-hidden="true" />}
                emptyText="필터에 맞는 선택 날짜 일이 없습니다."
              >
                {filteredPlannedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatus={handleStatus}
                    onDelete={handleDelete}
                    onNoteChange={handleNoteChange}
                    onMoveNextDay={handleMoveTaskToNextDay}
                    onOpenStudyDesk={handleOpenStudyDesk}
                    showScore
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
                    onMoveNextDay={handleMoveTaskToNextDay}
                    onOpenStudyDesk={handleOpenStudyDesk}
                    showNoteEditor={false}
                  />
                ))}
                <YeonButton
                  type="button"
                  variant="ghost"
                  className="justify-start"
                  onClick={() => handleAddTask(TODO_TASK_STATUSES.inbox)}
                >
                  <Plus size={15} aria-hidden="true" />할 일 추가
                </YeonButton>
              </TaskColumn>
              <TaskColumn
                title="Done"
                count={groups.doneToday.length}
                icon={<CheckCircle2 size={17} aria-hidden="true" />}
                emptyText="선택 날짜에 완료한 일이 없습니다."
              >
                {groups.doneToday.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatus={handleStatus}
                    onDelete={handleDelete}
                    onNoteChange={handleNoteChange}
                    onMoveNextDay={handleMoveTaskToNextDay}
                    onOpenStudyDesk={handleOpenStudyDesk}
                  />
                ))}
              </TaskColumn>
            </YeonView>
          </YeonView>

          <YeonView className="grid content-start gap-4">
            <CalendarPanel
              days={calendarDays}
              visibleDate={visibleDate}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              onMoveMonth={handleMoveMonth}
            />
            <PrioritySuggestionPanel
              lowPriorityCount={lowPriorityTasks.length}
              onMoveLowPriority={handleMoveLowPriorityTasks}
              onShowRecommendations={() =>
                setRecommendationLimit(selectedDateTasks.length)
              }
            />
            <YeonView className={`${BOARD_SURFACE_CLASS} p-4`}>
              <YeonView className="flex items-center justify-between">
                <YeonText
                  variant="unstyled"
                  tone="inherit"
                  className="text-[13px] font-bold text-[#666]"
                >
                  선택 날짜 총량
                </YeonText>
                <MoreVertical size={16} aria-hidden="true" />
              </YeonView>
              <YeonText
                variant="unstyled"
                tone="inherit"
                className="mt-2 text-[24px] font-black text-[#111]"
              >
                {getTaskMinuteSummary(selectedDateTasks)}
              </YeonText>
              <YeonText
                variant="unstyled"
                tone="inherit"
                className={`mt-1 text-[12px] font-semibold ${SUBTLE_TEXT_CLASS}`}
              >
                필터와 관계없이 선택 날짜에 남은 일 기준입니다.
              </YeonText>
            </YeonView>
          </YeonView>
        </YeonView>
      </YeonView>
    </YeonView>
  );
}
