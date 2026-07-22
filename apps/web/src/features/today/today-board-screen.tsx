"use client";

import {
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  Filter,
  Inbox,
  ListTodo,
  MoreVertical,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  TodayBoardResponse,
  TodayPriority,
  TodayTask,
  TodayTaskStatus,
  UpdateTodayTaskBody,
} from "@yeon/api-contract/today";
import {
  useYeonRouter,
  useYeonSearchParams,
} from "@yeon/ui/runtime/YeonNavigation";

import {
  formatMinutes,
  getLocalDate,
  normalizeDate,
  toMonth,
} from "@/features/today/today-date";
import {
  TodayErrorState,
  TodayLoadingState,
  TodayPageFrame,
} from "@/features/today/today-shell";
import {
  getTodayErrorMessage,
  isTodayAuthenticationError,
  useTodayBoard,
  useTodayCalendar,
  useTodayMutations,
} from "@/features/today/use-today-data";
import {
  useCommandLock,
  useSubmitLock,
} from "@/features/today/use-command-lock";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111] focus-visible:ring-offset-2";
const SURFACE = "rounded-2xl border border-[#dedede] bg-white";

const PRIORITIES: Array<{ value: TodayPriority; label: string }> = [
  { value: "high", label: "높음" },
  { value: "normal", label: "보통" },
  { value: "low", label: "낮음" },
];
const ESTIMATES = [5, 15, 30, 45, 60, 90, 120] as const;
type BoardTab = "today" | "inbox" | "done";
type SortValue = "priority" | "created" | "short" | "long";

export function TodayBoardScreen() {
  const searchParams = useYeonSearchParams();
  const router = useYeonRouter();
  const date = normalizeDate(searchParams.get("date"));
  const [visibleMonth, setVisibleMonth] = useState(toMonth(date));
  const boardQuery = useTodayBoard(date);
  const calendarQuery = useTodayCalendar(visibleMonth);

  useEffect(() => {
    const rawDate = searchParams.get("date");
    if (rawDate !== date) router.replace(`/today?date=${date}`);
  }, [date, router, searchParams]);

  useEffect(() => setVisibleMonth(toMonth(date)), [date]);

  const board = boardQuery.data;
  const summary = board?.summary;

  return (
    <TodayPageFrame
      active="board"
      date={date}
      visibleMonth={visibleMonth}
      onVisibleMonthChange={setVisibleMonth}
      calendar={calendarQuery.data}
      calendarError={
        calendarQuery.isError
          ? getTodayErrorMessage(calendarQuery.error)
          : undefined
      }
      calendarRetrying={calendarQuery.isFetching}
      onRetryCalendar={() => void calendarQuery.refetch()}
      totalCount={summary?.totalCount ?? 0}
      completedCount={summary?.completedCount ?? 0}
      estimatedMinutes={summary?.estimatedMinutes ?? 0}
    >
      {boardQuery.isError ? (
        <TodayErrorState
          message={getTodayErrorMessage(boardQuery.error)}
          onRetry={() => void boardQuery.refetch()}
          isRetrying={boardQuery.isFetching}
          showLogin={isTodayAuthenticationError(boardQuery.error)}
        />
      ) : boardQuery.isPending ? (
        <TodayLoadingState />
      ) : board ? (
        <BoardContent date={date} board={board} />
      ) : null}
    </TodayPageFrame>
  );
}

function BoardContent({
  date,
  board,
}: {
  date: string;
  board: TodayBoardResponse;
}) {
  const [tab, setTab] = useState<BoardTab>("today");
  const [sort, setSort] = useState<SortValue>("priority");
  const [priorityFilter, setPriorityFilter] = useState<TodayPriority | "all">(
    "all"
  );
  const mutations = useTodayMutations();
  const taskCommands = useCommandLock<string>();
  const tasks = useMemo(
    () => selectTasks(board.tasks, tab, sort, priorityFilter),
    [board.tasks, priorityFilter, sort, tab]
  );
  const doneCount = board.tasks.filter(
    (task) => task.status === "done" && task.plannedDate === date
  ).length;
  const todayCount = board.tasks.filter(
    (task) => task.status !== "inbox" && task.plannedDate === date
  ).length;
  const mutationError =
    mutations.createTask.error ??
    mutations.updateTask.error ??
    mutations.toggleTask.error ??
    mutations.deleteTask.error;

  return (
    <div className="space-y-4">
      <TaskComposer
        date={date}
        onCreate={(body) => {
          mutations.resetErrors();
          return mutations.createTask.mutateAsync(body);
        }}
        isPending={mutations.createTask.isPending}
      />
      <RecommendationCard
        recommendation={board.recommendation}
        onShow={() => setTab("today")}
      />
      <section className={`${SURFACE} overflow-hidden`} aria-label="할 일 목록">
        <div className="flex flex-col gap-3 border-b border-[#e8e8e8] px-4 pt-2 sm:flex-row sm:items-end sm:justify-between sm:px-5">
          <div
            role="tablist"
            aria-label="할 일 상태"
            className="flex min-w-0 overflow-x-auto"
          >
            <BoardTabButton
              active={tab === "today"}
              label="Today"
              count={todayCount}
              onClick={() => setTab("today")}
            />
            <BoardTabButton
              active={tab === "inbox"}
              label="Inbox"
              count={board.inboxCount}
              onClick={() => setTab("inbox")}
            />
            <BoardTabButton
              active={tab === "done"}
              label="Done"
              count={doneCount}
              onClick={() => setTab("done")}
            />
          </div>
          <div className="flex gap-2 pb-3">
            <label className="relative">
              <span className="sr-only">정렬</span>
              <select
                aria-label="정렬"
                value={sort}
                onChange={(event) => setSort(event.target.value as SortValue)}
                className={`${FOCUS_RING} h-10 appearance-none rounded-xl border border-[#dedede] bg-white py-0 pl-3 pr-9 text-xs font-bold text-[#444]`}
              >
                <option value="priority">우선순위 순</option>
                <option value="created">등록 순서</option>
                <option value="short">짧은 시간 순</option>
                <option value="long">긴 시간 순</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-3"
                size={15}
                aria-hidden="true"
              />
            </label>
            <label className="relative">
              <span className="sr-only">우선순위 필터</span>
              <Filter
                className="pointer-events-none absolute left-3 top-3"
                size={15}
                aria-hidden="true"
              />
              <select
                aria-label="우선순위 필터"
                value={priorityFilter}
                onChange={(event) =>
                  setPriorityFilter(event.target.value as TodayPriority | "all")
                }
                className={`${FOCUS_RING} h-10 appearance-none rounded-xl border border-[#dedede] bg-white py-0 pl-9 pr-8 text-xs font-bold text-[#444]`}
              >
                <option value="all">전체</option>
                {PRIORITIES.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2.5 top-3"
                size={15}
                aria-hidden="true"
              />
            </label>
          </div>
        </div>

        {mutationError ? (
          <p
            className="border-b border-[#f0d5d2] bg-[#fff8f7] px-5 py-3 text-sm text-[#a33]"
            role="alert"
          >
            {getTodayErrorMessage(mutationError)}
          </p>
        ) : null}

        {tasks.length ? (
          <ul>
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                selectedDate={date}
                busy={taskCommands.isLocked(task.id)}
                onToggle={() => {
                  mutations.resetErrors();
                  void taskCommands
                    .run(task.id, () => mutations.toggleTask.mutateAsync(task))
                    .catch(() => undefined);
                }}
                onMove={(plannedDate) => {
                  mutations.resetErrors();
                  void taskCommands
                    .run(task.id, () =>
                      mutations.updateTask.mutateAsync({
                        taskId: task.id,
                        body: {
                          version: task.version,
                          title: task.title,
                          priority: task.priority,
                          estimatedMinutes: task.estimatedMinutes,
                          categoryLabel: task.categoryLabel,
                          plannedDate,
                        },
                      })
                    )
                    .catch(() => undefined);
                }}
                onUpdate={(body) => {
                  mutations.resetErrors();
                  return taskCommands.run(task.id, () =>
                    mutations.updateTask.mutateAsync({ taskId: task.id, body })
                  );
                }}
                onDelete={() => {
                  mutations.resetErrors();
                  void taskCommands
                    .run(task.id, () => mutations.deleteTask.mutateAsync(task))
                    .catch(() => undefined);
                }}
              />
            ))}
          </ul>
        ) : (
          <EmptyList
            tab={tab}
            onAdd={() =>
              document
                .querySelector<HTMLInputElement>("#today-task-title")
                ?.focus()
            }
          />
        )}
      </section>
    </div>
  );
}

function TaskComposer({
  date,
  onCreate,
  isPending,
}: {
  date: string;
  onCreate(body: {
    title: string;
    priority: TodayPriority;
    estimatedMinutes: number;
    categoryLabel: null;
    plannedDate: string | null;
  }): Promise<unknown>;
  isPending: boolean;
}) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TodayPriority>("normal");
  const [estimate, setEstimate] = useState<number | "direct">(30);
  const [directMinutes, setDirectMinutes] = useState(30);
  const inputRef = useRef<HTMLInputElement>(null);
  const runSubmit = useSubmitLock();
  const minutes = estimate === "direct" ? directMinutes : estimate;
  const valid = title.trim().length > 0 && minutes >= 1 && minutes <= 1440;
  const isToday = date === getLocalDate();

  const submit = async (plannedDate: string | null) => {
    if (!valid || isPending) return;
    await runSubmit(async () => {
      try {
        await onCreate({
          title: title.trim(),
          priority,
          estimatedMinutes: minutes,
          categoryLabel: null,
          plannedDate,
        });
        setTitle("");
        setPriority("normal");
        setEstimate(30);
        setDirectMinutes(30);
        inputRef.current?.focus();
      } catch {
        inputRef.current?.focus();
      }
    });
  };

  return (
    <section className={`${SURFACE} p-4 sm:p-5`} aria-label="할 일 추가">
      <div className="grid gap-2 xl:grid-cols-[minmax(220px,1fr)_112px_122px_auto_auto]">
        <label className="relative">
          <span className="sr-only">할 일 제목</span>
          <Circle
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aaa]"
            size={20}
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            id="today-task-title"
            value={title}
            maxLength={200}
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void submit(date);
            }}
            placeholder="할 일을 입력하세요"
            className={`${FOCUS_RING} h-14 w-full rounded-xl border border-[#d8d8d8] bg-white pl-12 pr-4 text-[15px] font-semibold placeholder:font-normal placeholder:text-[#aaa] focus:border-[#111]`}
          />
        </label>
        <LabeledSelect
          label="우선순위"
          value={priority}
          onChange={(value) => setPriority(value as TodayPriority)}
        >
          {PRIORITIES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </LabeledSelect>
        <EstimateSelect value={estimate} onChange={setEstimate} />
        <button
          type="button"
          disabled={!valid || isPending}
          onClick={() => void submit(date)}
          className={`${FOCUS_RING} min-h-14 rounded-xl bg-[#111] px-5 text-sm font-black text-white transition-colors hover:bg-[#292929] disabled:cursor-not-allowed disabled:bg-[#c8c8c8]`}
        >
          {isPending
            ? "저장 중"
            : isToday
              ? "오늘에 추가"
              : `${Number(date.slice(5, 7))}월 ${Number(date.slice(8, 10))}일에 추가`}
        </button>
        <button
          type="button"
          disabled={!valid || isPending}
          onClick={() => void submit(null)}
          className={`${FOCUS_RING} min-h-14 rounded-xl px-3 text-sm font-bold text-[#444] hover:bg-[#f4f4f4] disabled:text-[#aaa]`}
        >
          Inbox에 저장
        </button>
      </div>
      {estimate === "direct" ? (
        <label className="mt-3 flex max-w-xs items-center gap-3 text-sm font-bold text-[#555]">
          직접 입력
          <input
            type="number"
            min={1}
            max={1440}
            value={directMinutes}
            onChange={(event) => setDirectMinutes(Number(event.target.value))}
            className={`${FOCUS_RING} h-10 w-24 rounded-lg border border-[#d8d8d8] px-3`}
          />
          분
        </label>
      ) : null}
    </section>
  );
}

function LabeledSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange(value: string): void;
  children: React.ReactNode;
}) {
  return (
    <label className="relative flex min-h-14 flex-col justify-center rounded-xl border border-[#d8d8d8] bg-white px-3">
      <span className="text-[10px] font-bold text-[#777]">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${FOCUS_RING} mt-0.5 w-full appearance-none bg-transparent pr-5 text-sm font-black`}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2"
        size={15}
        aria-hidden="true"
      />
    </label>
  );
}

function EstimateSelect({
  value,
  onChange,
}: {
  value: number | "direct";
  onChange(value: number | "direct"): void;
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const options: Array<{ value: number | "direct"; label: string }> = [
    ...ESTIMATES.map((minutes) => ({
      value: minutes,
      label: minutes === 120 ? "2시간" : `${minutes}분`,
    })),
    { value: "direct", label: "직접 입력" },
  ];
  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? "30분";

  const select = (nextValue: number | "direct") => {
    onChange(nextValue);
    detailsRef.current?.removeAttribute("open");
  };

  return (
    <details
      ref={detailsRef}
      className="relative z-30"
      onKeyDown={(event) => {
        if (event.key === "Escape") detailsRef.current?.removeAttribute("open");
      }}
    >
      <summary
        role="button"
        aria-label="예상 시간"
        className={`${FOCUS_RING} flex min-h-14 cursor-pointer list-none flex-col justify-center rounded-xl border border-[#d8d8d8] bg-white px-3`}
      >
        <span className="text-[10px] font-bold text-[#777]">예상 시간</span>
        <span className="mt-0.5 flex items-center justify-between text-sm font-black">
          {selectedLabel}
          <ChevronDown size={15} aria-hidden="true" />
        </span>
      </summary>
      <div
        role="listbox"
        aria-label="예상 시간 선택"
        className="absolute left-0 right-0 top-[calc(100%+6px)] overflow-hidden rounded-xl border border-[#dedede] bg-white p-1.5 shadow-xl"
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => select(option.value)}
              className={`${FOCUS_RING} flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-[#f4f4f4] ${selected ? "bg-[#f3f3f3]" : ""}`}
            >
              {option.label}
              {selected ? <Check size={15} aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>
    </details>
  );
}

function RecommendationCard({
  recommendation,
  onShow,
}: {
  recommendation: TodayBoardResponse["recommendation"];
  onShow(): void;
}) {
  return (
    <section
      className={`${SURFACE} flex min-h-[112px] flex-col justify-between gap-5 p-5 sm:flex-row sm:items-center`}
    >
      <div className="flex min-w-0 gap-3">
        <Sparkles className="mt-0.5 shrink-0" size={23} aria-hidden="true" />
        <div className="min-w-0">
          <h2 className="text-base font-black">지금 하면 좋은 일</h2>
          {recommendation ? (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#444]">
              <strong className="mr-1 truncate text-[#222]">
                {recommendation.task.title}
              </strong>
              <PriorityBadge priority={recommendation.task.priority} />
              <span className="rounded-full border border-[#e3e3e3] px-2.5 py-1 text-xs">
                {formatMinutes(recommendation.task.estimatedMinutes)}
              </span>
            </div>
          ) : (
            <div className="mt-2 text-sm text-[#666]">
              <p>추천할 일이 아직 없습니다.</p>
              <p className="mt-1 text-xs">
                Inbox에서 가져오면 집중할 일을 추천해드려요.
              </p>
            </div>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onShow}
        className={`${FOCUS_RING} shrink-0 rounded-xl border border-[#dedede] px-4 py-3 text-sm font-bold hover:bg-[#f5f5f5]`}
      >
        {recommendation ? "추천 목록 보기" : "Today 목록 보기"}
      </button>
    </section>
  );
}

function BoardTabButton({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick(): void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`${FOCUS_RING} relative min-w-[110px] px-3 py-4 text-left text-sm ${active ? "font-black text-[#111]" : "font-semibold text-[#666]"}`}
    >
      {label} <span className="ml-2">{count}</span>
      {active ? (
        <span
          className="absolute inset-x-2 bottom-0 h-0.5 bg-[#111]"
          aria-hidden="true"
        />
      ) : null}
    </button>
  );
}

function TaskRow({
  task,
  selectedDate,
  busy,
  onToggle,
  onMove,
  onUpdate,
  onDelete,
}: {
  task: TodayTask;
  selectedDate: string;
  busy: boolean;
  onToggle(): void;
  onMove(date: string | null): void;
  onUpdate(body: UpdateTodayTaskBody): Promise<unknown>;
  onDelete(): void;
}) {
  const done = task.status === "done";
  const inbox = task.status === "inbox";
  const menuRef = useRef<HTMLDetailsElement>(null);
  const runEditSubmit = useSubmitLock();
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editPriority, setEditPriority] = useState(task.priority);
  const [editMinutes, setEditMinutes] = useState(task.estimatedMinutes);
  const [editDate, setEditDate] = useState(task.plannedDate ?? "");
  const editValid =
    editTitle.trim().length > 0 && editMinutes >= 1 && editMinutes <= 1440;

  const startEditing = () => {
    setEditTitle(task.title);
    setEditPriority(task.priority);
    setEditMinutes(task.estimatedMinutes);
    setEditDate(task.plannedDate ?? "");
    setEditing(true);
    menuRef.current?.removeAttribute("open");
  };

  const submitEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editValid || busy) return;
    await runEditSubmit(async () => {
      try {
        const result = await onUpdate({
          version: task.version,
          title: editTitle.trim(),
          priority: editPriority,
          estimatedMinutes: editMinutes,
          categoryLabel: task.categoryLabel,
          plannedDate: editDate || null,
        });
        if (result !== undefined) setEditing(false);
      } catch {
        // mutation 상태가 오류 문구를 렌더하며 편집값은 재시도를 위해 유지한다.
      }
    });
  };

  return (
    <li className="grid min-h-[74px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-[#ededed] px-4 last:border-b-0 sm:grid-cols-[auto_minmax(180px,1fr)_88px_90px_110px_auto] sm:px-5">
      <button
        type="button"
        disabled={inbox || busy}
        onClick={onToggle}
        aria-label={
          inbox
            ? `${task.title}, 날짜 지정 필요`
            : `${task.title} ${done ? "완료 취소" : "완료"}`
        }
        className={`${FOCUS_RING} grid size-6 place-items-center rounded-md border ${done ? "border-[#111] bg-[#111] text-white" : "border-[#aaa] bg-white text-transparent"} disabled:cursor-not-allowed disabled:border-[#ccc]`}
      >
        <Check size={16} aria-hidden="true" />
      </button>
      <div className="min-w-0 py-4">
        <p
          className={`truncate text-sm font-bold ${done ? "text-[#777] line-through" : "text-[#222]"}`}
        >
          {task.title}
        </p>
        {done && task.completedAt ? (
          <p className="mt-1 text-[11px] font-medium text-[#999]">
            완료 {formatCompletedTime(task.completedAt)}
          </p>
        ) : null}
        <div className="mt-2 flex gap-2 sm:hidden">
          <PriorityBadge priority={task.priority} />
          <span className="text-xs text-[#666]">
            {formatMinutes(task.estimatedMinutes)}
          </span>
        </div>
      </div>
      <div className="hidden sm:block">
        <PriorityBadge priority={task.priority} />
      </div>
      <span className="hidden text-sm text-[#333] sm:block">
        {formatMinutes(task.estimatedMinutes)}
      </span>
      <span className="hidden w-fit rounded-lg border border-[#e5e5e5] px-2.5 py-1 text-xs text-[#555] sm:block">
        {task.categoryLabel ?? (inbox ? "Inbox" : "일반")}
      </span>
      <details ref={menuRef} className="relative">
        <summary
          className={`${FOCUS_RING} grid size-9 cursor-pointer list-none place-items-center rounded-lg hover:bg-[#f3f3f3]`}
          aria-label={`${task.title} 더보기`}
          aria-disabled={busy}
          onClick={(event) => {
            if (busy) event.preventDefault();
          }}
        >
          <MoreVertical size={18} aria-hidden="true" />
        </summary>
        <div className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-[#dedede] bg-white p-1.5 text-sm shadow-xl">
          <button
            type="button"
            disabled={busy}
            onClick={startEditing}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-semibold hover:bg-[#f4f4f4]"
          >
            수정
          </button>
          {inbox ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => onMove(selectedDate)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-semibold hover:bg-[#f4f4f4]"
            >
              <ListTodo size={15} />
              선택 날짜로 이동
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => onMove(null)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-semibold hover:bg-[#f4f4f4]"
            >
              <Inbox size={15} />
              Inbox로 이동
            </button>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              if (window.confirm("이 할 일을 삭제할까요?")) onDelete();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-semibold text-[#a33] hover:bg-[#fff3f2]"
          >
            <Trash2 size={15} />
            삭제
          </button>
        </div>
      </details>
      {editing ? (
        <form
          onSubmit={submitEdit}
          className="col-span-full mb-4 grid gap-2 rounded-xl bg-[#f7f7f6] p-3 sm:grid-cols-[minmax(180px,1fr)_100px_100px_150px_auto]"
        >
          <input
            aria-label={`${task.title} 제목 수정`}
            value={editTitle}
            maxLength={200}
            onChange={(event) => setEditTitle(event.target.value)}
            className={`${FOCUS_RING} h-10 min-w-0 rounded-lg border border-[#d8d8d8] bg-white px-3 text-sm font-semibold`}
          />
          <select
            aria-label={`${task.title} 우선순위 수정`}
            value={editPriority}
            onChange={(event) =>
              setEditPriority(event.target.value as TodayPriority)
            }
            className={`${FOCUS_RING} h-10 rounded-lg border border-[#d8d8d8] bg-white px-2 text-sm`}
          >
            {PRIORITIES.map((priority) => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
          <input
            aria-label={`${task.title} 예상 시간 수정`}
            type="number"
            min={1}
            max={1440}
            value={editMinutes}
            onChange={(event) => setEditMinutes(Number(event.target.value))}
            className={`${FOCUS_RING} h-10 rounded-lg border border-[#d8d8d8] bg-white px-3 text-sm`}
          />
          <input
            aria-label={`${task.title} 날짜 수정`}
            type="date"
            value={editDate}
            onChange={(event) => setEditDate(event.target.value)}
            className={`${FOCUS_RING} h-10 rounded-lg border border-[#d8d8d8] bg-white px-3 text-sm`}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!editValid || busy}
              className={`${FOCUS_RING} h-10 rounded-lg bg-[#111] px-4 text-sm font-bold text-white disabled:bg-[#bbb]`}
            >
              저장
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className={`${FOCUS_RING} h-10 rounded-lg border border-[#d8d8d8] bg-white px-3 text-sm font-bold`}
            >
              취소
            </button>
          </div>
        </form>
      ) : null}
    </li>
  );
}

function PriorityBadge({ priority }: { priority: TodayPriority }) {
  const label =
    PRIORITIES.find((item) => item.value === priority)?.label ?? "보통";
  return (
    <span
      className={`inline-flex w-fit rounded-lg border px-2.5 py-1 text-[11px] font-bold ${priority === "high" ? "border-[#ffd9d3] bg-[#fff8f7] text-[#e04432]" : priority === "low" ? "border-[#dcecff] bg-[#f7fbff] text-[#2875cc]" : "border-[#e4e4e4] bg-[#fafafa] text-[#555]"}`}
    >
      {label}
    </span>
  );
}

function EmptyList({ tab, onAdd }: { tab: BoardTab; onAdd(): void }) {
  const content: Record<
    BoardTab,
    { icon: React.ReactNode; title: string; description: string }
  > = {
    today: {
      icon: <ListTodo size={42} />,
      title: "오늘 끝낼 첫 할 일을 추가해보세요.",
      description:
        "작은 한 걸음이 하루를 바꿔요. 지금 할 일을 추가하고 집중해보세요.",
    },
    inbox: {
      icon: <Inbox size={42} />,
      title: "Inbox가 비어 있습니다.",
      description: "날짜를 아직 정하지 않은 일을 잠시 보관할 수 있어요.",
    },
    done: {
      icon: <CheckCircle2 size={42} />,
      title: "완료한 일이 아직 없습니다.",
      description: "하나씩 완료하면 이곳에 오늘의 성취가 쌓입니다.",
    },
  };
  const selected = content[tab];
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="grid size-24 place-items-center rounded-full bg-[#f3f3f3] text-[#999]">
        {selected.icon}
      </div>
      <h3 className="mt-6 text-lg font-black tracking-[-0.03em]">
        {selected.title}
      </h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-[#777]">
        {selected.description}
      </p>
      {tab === "today" ? (
        <button
          type="button"
          onClick={onAdd}
          className={`${FOCUS_RING} mt-6 inline-flex items-center gap-2 rounded-xl bg-[#111] px-5 py-3 text-sm font-black text-white`}
        >
          <Plus size={17} />첫 할 일 추가
        </button>
      ) : null}
    </div>
  );
}

function selectTasks(
  tasks: TodayTask[],
  tab: BoardTab,
  sort: SortValue,
  priority: TodayPriority | "all"
) {
  const statuses: Record<BoardTab, TodayTaskStatus[]> = {
    today: ["planned", "done"],
    inbox: ["inbox"],
    done: ["done"],
  };
  const priorityRank: Record<TodayPriority, number> = {
    high: 0,
    normal: 1,
    low: 2,
  };
  return [...tasks]
    .filter(
      (task) =>
        statuses[tab].includes(task.status) &&
        (priority === "all" || task.priority === priority)
    )
    .sort((left, right) => {
      if (sort === "short")
        return left.estimatedMinutes - right.estimatedMinutes;
      if (sort === "long")
        return right.estimatedMinutes - left.estimatedMinutes;
      if (sort === "created")
        return left.createdAt.localeCompare(right.createdAt);
      return (
        priorityRank[left.priority] - priorityRank[right.priority] ||
        left.createdAt.localeCompare(right.createdAt)
      );
    });
}

function formatCompletedTime(completedAt: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(completedAt));
}
