"use client";

import {
  BookOpen,
  Car,
  CircleDot,
  Coffee,
  Dumbbell,
  Gamepad2,
  Moon,
  PencilLine,
  Plus,
  Settings2,
  Trash2,
  Utensils,
} from "lucide-react";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
  TODAY_ACTIVITY_COLORS,
  TODAY_ACTIVITY_ICONS,
  type CreateTodayActivityTypeBody,
  type TodayActivityType,
  type TodayRecordResponse,
} from "@yeon/api-contract/today";
import {
  useYeonRouter,
  useYeonSearchParams,
} from "@yeon/ui/runtime/YeonNavigation";

import {
  formatMinutes,
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
  useTodayActivityTypes,
  useTodayCalendar,
  useTodayRecord,
  useTodayRecordMutations,
} from "@/features/today/use-today-data";
import {
  useCommandLock,
  useSubmitLock,
} from "@/features/today/use-command-lock";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111] focus-visible:ring-offset-2";
const SURFACE = "rounded-2xl border border-[#dedede] bg-white";

type TodayActivityColor = TodayActivityType["colorToken"];
type TodayActivityIcon = TodayActivityType["iconKey"];

const COLOR_CLASS = {
  blue: "border-[#b9d7ff] bg-[#eaf4ff] text-[#155fa8]",
  green: "border-[#b9e2cc] bg-[#ecf8f1] text-[#26724a]",
  orange: "border-[#ffd3ab] bg-[#fff3e6] text-[#a95b17]",
  purple: "border-[#dac7f4] bg-[#f4edfc] text-[#6742a0]",
  yellow: "border-[#f1dda1] bg-[#fff8dc] text-[#876a13]",
  red: "border-[#fac3bd] bg-[#fff0ee] text-[#a93d31]",
  gray: "border-[#d6d6d6] bg-[#f2f2f2] text-[#555]",
} satisfies Record<TodayActivityColor, string>;

const COLOR_LABEL = {
  blue: "파랑",
  green: "초록",
  orange: "주황",
  purple: "보라",
  yellow: "노랑",
  red: "빨강",
  gray: "회색",
} satisfies Record<TodayActivityColor, string>;

const ICONS = {
  book: BookOpen,
  gamepad: Gamepad2,
  utensils: Utensils,
  car: Car,
  coffee: Coffee,
  moon: Moon,
  dumbbell: Dumbbell,
  circle: CircleDot,
} satisfies Record<
  TodayActivityIcon,
  ComponentType<{ size?: number; className?: string }>
>;

const ICON_LABEL = {
  book: "책",
  gamepad: "게임패드",
  utensils: "식기",
  car: "자동차",
  coffee: "컵",
  moon: "달",
  dumbbell: "운동",
  circle: "점",
} satisfies Record<TodayActivityIcon, string>;

export function TodayRecordScreen() {
  const searchParams = useYeonSearchParams();
  const router = useYeonRouter();
  const date = normalizeDate(searchParams.get("date"));
  const [visibleMonth, setVisibleMonth] = useState(toMonth(date));
  const recordQuery = useTodayRecord(date);
  const activityTypesQuery = useTodayActivityTypes();
  const calendarQuery = useTodayCalendar(visibleMonth);
  const queryError = recordQuery.error ?? activityTypesQuery.error;

  useEffect(() => {
    const rawDate = searchParams.get("date");
    if (rawDate !== date) router.replace(`/today/record?date=${date}`);
  }, [date, router, searchParams]);

  useEffect(() => setVisibleMonth(toMonth(date)), [date]);

  const record = recordQuery.data;
  return (
    <TodayPageFrame
      active="record"
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
      totalCount={24}
      completedCount={record?.summary.recordedHours ?? 0}
      estimatedMinutes={(record?.summary.recordedHours ?? 0) * 60}
    >
      {queryError ? (
        <TodayErrorState
          message={getTodayErrorMessage(queryError)}
          onRetry={() => {
            if (recordQuery.isError) void recordQuery.refetch();
            if (activityTypesQuery.isError) void activityTypesQuery.refetch();
          }}
          isRetrying={recordQuery.isFetching || activityTypesQuery.isFetching}
          showLogin={isTodayAuthenticationError(queryError)}
        />
      ) : recordQuery.isPending || activityTypesQuery.isPending ? (
        <TodayLoadingState />
      ) : record && activityTypesQuery.data ? (
        <RecordContent
          date={date}
          record={record}
          activityTypes={activityTypesQuery.data.activityTypes}
        />
      ) : null}
    </TodayPageFrame>
  );
}

function RecordContent({
  date,
  record,
  activityTypes,
}: {
  date: string;
  record: TodayRecordResponse;
  activityTypes: TodayActivityType[];
}) {
  const activeTypes = useMemo(
    () => activityTypes.filter((activity) => activity.active),
    [activityTypes]
  );
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    activeTypes[0]?.id ?? null
  );
  const [editingNoteHour, setEditingNoteHour] = useState<number | null>(null);
  const [manageOpen, setManageOpen] = useState(false);
  const mutations = useTodayRecordMutations(date);
  const activityCommands = useCommandLock<string>();
  const slotCommands = useCommandLock<number>();
  const error =
    mutations.upsertSlot.error ??
    mutations.deleteSlot.error ??
    mutations.createActivityType.error ??
    mutations.updateActivityType.error;

  useEffect(() => {
    if (
      !selectedActivityId ||
      !activeTypes.some((activity) => activity.id === selectedActivityId)
    ) {
      setSelectedActivityId(activeTypes[0]?.id ?? null);
    }
  }, [activeTypes, selectedActivityId]);

  useEffect(() => setEditingNoteHour(null), [date]);

  const editingNoteSlot =
    editingNoteHour === null
      ? null
      : (record.slots.find((slot) => slot.hour === editingNoteHour) ?? null);
  const editingActivityTypeId = editingNoteSlot?.activityType?.id ?? null;

  return (
    <div className="space-y-4">
      <section className={`${SURFACE} p-4 sm:p-5`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black tracking-[-0.03em]">활동 선택</h2>
            <p className="mt-1 text-sm text-[#666]">
              활동을 고른 뒤 시간 블록을 눌러 기록하세요.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setManageOpen((value) => !value)}
            aria-expanded={manageOpen}
            className={`${FOCUS_RING} inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#dedede] px-4 text-sm font-bold hover:bg-[#f5f5f5]`}
          >
            <Settings2 size={17} aria-hidden="true" />
            활동 관리
          </button>
        </div>
        <div
          className="mt-3 flex gap-2 overflow-x-auto px-1 py-1"
          role={activeTypes.length ? "listbox" : undefined}
          aria-label={activeTypes.length ? "기록할 활동" : undefined}
        >
          {activeTypes.length ? (
            activeTypes.map((activity) => (
              <ActivityButton
                key={activity.id}
                activity={activity}
                selected={selectedActivityId === activity.id}
                onClick={() => setSelectedActivityId(activity.id)}
              />
            ))
          ) : (
            <div className="flex min-w-full flex-col items-start gap-2 rounded-xl border border-dashed border-[#d8d8d8] bg-[#fafafa] px-4 py-4 text-sm text-[#666] sm:flex-row sm:items-center sm:justify-between">
              <span>
                사용 중인 활동이 없습니다. 활동 관리에서 하나를 추가하거나 다시
                사용하세요.
              </span>
              <button
                type="button"
                onClick={() => setManageOpen(true)}
                className={`${FOCUS_RING} shrink-0 rounded-lg border border-[#d8d8d8] bg-white px-3 py-2 font-bold text-[#333]`}
              >
                활동 관리 열기
              </button>
            </div>
          )}
        </div>
      </section>

      {manageOpen ? (
        <ActivityManager
          activityTypes={activityTypes}
          isCreating={mutations.createActivityType.isPending}
          isActivityPending={activityCommands.isLocked}
          onCreate={(body) => {
            mutations.resetErrors();
            return mutations.createActivityType.mutateAsync(body);
          }}
          onToggle={(activity) => {
            mutations.resetErrors();
            void activityCommands
              .run(activity.id, () =>
                mutations.updateActivityType.mutateAsync({
                  activityTypeId: activity.id,
                  body: {
                    version: activity.version,
                    name: activity.name,
                    colorToken: activity.colorToken,
                    iconKey: activity.iconKey,
                    sortOrder: activity.sortOrder,
                    active: !activity.active,
                  },
                })
              )
              .catch(() => undefined);
          }}
        />
      ) : null}

      {error ? (
        <p
          className="rounded-xl border border-[#f0d5d2] bg-[#fff8f7] px-4 py-3 text-sm text-[#a33]"
          role="alert"
        >
          {getTodayErrorMessage(error)}
        </p>
      ) : null}

      <section
        className={`${SURFACE} p-4 sm:p-5`}
        aria-labelledby="record-timeline-title"
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2
              id="record-timeline-title"
              className="text-lg font-black tracking-[-0.03em]"
            >
              24시간 타임라인
            </h2>
            <p className="mt-1 text-sm text-[#666]">
              {record.summary.recordedHours}시간 기록 ·{" "}
              {record.summary.recordRate}%
            </p>
          </div>
          <span className="text-xs font-bold text-[#777]">1칸 = 1시간</span>
        </div>
        <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-6 xl:grid-cols-8">
          {record.slots.map((slot) => (
            <HourCell
              key={slot.hour}
              slot={slot}
              disabled={!selectedActivityId || slotCommands.isLocked(slot.hour)}
              clearDisabled={slotCommands.isLocked(slot.hour)}
              onAssign={() => {
                if (selectedActivityId) {
                  mutations.resetErrors();
                  void slotCommands
                    .run(slot.hour, () =>
                      mutations.upsertSlot.mutateAsync({
                        hour: slot.hour,
                        activityTypeId: selectedActivityId,
                        note: slot.note,
                      })
                    )
                    .catch(() => undefined);
                }
              }}
              onClear={() => {
                mutations.resetErrors();
                void slotCommands
                  .run(slot.hour, () =>
                    mutations.deleteSlot.mutateAsync(slot.hour)
                  )
                  .then(() => {
                    if (editingNoteHour === slot.hour) {
                      setEditingNoteHour(null);
                    }
                  })
                  .catch(() => undefined);
              }}
              onEditNote={() => setEditingNoteHour(slot.hour)}
            />
          ))}
        </div>
        {editingNoteSlot?.activityType && editingActivityTypeId ? (
          <SlotNoteEditor
            key={`${date}-${editingNoteSlot.hour}`}
            slot={editingNoteSlot}
            isSaving={slotCommands.isLocked(editingNoteSlot.hour)}
            onCancel={() => setEditingNoteHour(null)}
            onSave={async (note) => {
              mutations.resetErrors();
              await slotCommands.run(editingNoteSlot.hour, () =>
                mutations.upsertSlot.mutateAsync({
                  hour: editingNoteSlot.hour,
                  activityTypeId: editingActivityTypeId,
                  note,
                })
              );
              setEditingNoteHour(null);
            }}
          />
        ) : null}
      </section>

      <section className={`${SURFACE} p-5`}>
        <h2 className="text-lg font-black tracking-[-0.03em]">활동별 기록</h2>
        {Object.keys(record.summary.activityMinutes).length ? (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {Object.entries(record.summary.activityMinutes)
              .sort(([, left], [, right]) => right - left)
              .map(([name, minutes]) => (
                <li
                  key={name}
                  className="flex items-center justify-between rounded-xl border border-[#e7e7e7] px-4 py-3 text-sm"
                >
                  <span className="font-bold">{name}</span>
                  <span className="text-[#666]">{formatMinutes(minutes)}</span>
                </li>
              ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-[#777]">
            시간 블록을 채우면 활동별 시간이 여기에 정리됩니다.
          </p>
        )}
      </section>
    </div>
  );
}

function ActivityButton({
  activity,
  selected,
  onClick,
}: {
  activity: TodayActivityType;
  selected: boolean;
  onClick(): void;
}) {
  const Icon = ICONS[activity.iconKey] ?? CircleDot;
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onClick}
      className={`${FOCUS_RING} inline-flex min-w-max items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold transition-transform active:scale-[0.98] ${COLOR_CLASS[activity.colorToken] ?? COLOR_CLASS.gray} ${selected ? "ring-2 ring-[#111] ring-offset-2" : "opacity-80 hover:opacity-100"}`}
    >
      <Icon size={17} aria-hidden="true" />
      {activity.name}
    </button>
  );
}

function HourCell({
  slot,
  disabled,
  clearDisabled,
  onAssign,
  onClear,
  onEditNote,
}: {
  slot: TodayRecordResponse["slots"][number];
  disabled: boolean;
  clearDisabled: boolean;
  onAssign(): void;
  onClear(): void;
  onEditNote(): void;
}) {
  const Icon = slot.activityType
    ? (ICONS[slot.activityType.iconKey] ?? CircleDot)
    : Plus;
  return (
    <div
      className={`group relative flex min-h-28 flex-col rounded-xl border p-2 transition-colors ${slot.activityType ? (COLOR_CLASS[slot.activityType.colorToken] ?? COLOR_CLASS.gray) : "border-[#e2e2e2] bg-[#fafafa] text-[#999] hover:border-[#aaa] hover:bg-white"}`}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={onAssign}
        aria-label={`${slot.hour}시, ${slot.activityType?.name ?? "기록 없음"}${slot.note ? `, 설명 ${slot.note}` : ""}. 선택한 활동으로 기록`}
        className={`${FOCUS_RING} flex min-h-0 flex-1 cursor-pointer flex-col items-center justify-center rounded-lg disabled:cursor-not-allowed`}
      >
        <span className="absolute left-2 top-2 text-[11px] font-black tabular-nums">
          {String(slot.hour).padStart(2, "0")}
        </span>
        <Icon size={22} aria-hidden="true" />
        <span className="mt-1 max-w-full truncate text-[11px] font-bold">
          {slot.activityType?.name ?? "기록"}
        </span>
      </button>
      {slot.activityType ? (
        <>
          <button
            type="button"
            disabled={clearDisabled}
            onClick={onEditNote}
            aria-label={`${slot.hour}시 설명 ${slot.note ? "수정" : "추가"}`}
            title={slot.note ?? "설명 추가"}
            className={`${FOCUS_RING} mt-1 flex min-h-7 w-full cursor-pointer items-center justify-center rounded-md border border-black/10 bg-white/45 px-1.5 py-1 text-center text-[9px] font-bold leading-[1.25] hover:bg-white/75 disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {slot.note ? (
              <span className="line-clamp-2 max-w-full break-all">
                {slot.note}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 opacity-70">
                <PencilLine size={10} aria-hidden="true" />
                설명 추가
              </span>
            )}
          </button>
          <button
            type="button"
            disabled={clearDisabled}
            onClick={(event) => {
              event.stopPropagation();
              onClear();
            }}
            aria-label={`${slot.hour}시 기록 삭제`}
            className={`${FOCUS_RING} absolute right-1.5 top-1.5 grid size-7 cursor-pointer place-items-center rounded-lg bg-white/80 opacity-100 shadow-sm hover:bg-white sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100`}
          >
            <Trash2 size={13} aria-hidden="true" />
          </button>
        </>
      ) : null}
    </div>
  );
}

function SlotNoteEditor({
  slot,
  isSaving,
  onSave,
  onCancel,
}: {
  slot: TodayRecordResponse["slots"][number];
  isSaving: boolean;
  onSave(note: string | null): Promise<unknown>;
  onCancel(): void;
}) {
  const [note, setNote] = useState(slot.note ?? "");
  const normalizedNote = note.trim();
  const initialNote = slot.note ?? "";
  const helpId = `slot-note-${slot.hour}-help`;

  return (
    <form
      aria-label={`${slot.hour}시 설명 편집`}
      className="mt-4 rounded-xl border border-[#d8d8d8] bg-[#fafafa] p-3 sm:p-4"
      onSubmit={async (event) => {
        event.preventDefault();
        try {
          await onSave(normalizedNote || null);
        } catch {
          // 상위 mutation 오류 영역을 유지하고 사용자의 입력도 보존한다.
        }
      }}
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <label
          htmlFor={`slot-note-${slot.hour}`}
          className="text-sm font-black text-[#222]"
        >
          {String(slot.hour).padStart(2, "0")}시 · {slot.activityType?.name}{" "}
          설명
        </label>
        <span className="text-xs font-medium text-[#777]">
          블록에는 최대 두 줄만 표시됩니다.
        </span>
      </div>
      <textarea
        id={`slot-note-${slot.hour}`}
        value={note}
        maxLength={200}
        rows={2}
        autoFocus
        aria-describedby={helpId}
        onChange={(event) => setNote(event.target.value)}
        placeholder="예: 카페에서 커피를 마시며 쉬었어요."
        className={`${FOCUS_RING} mt-3 w-full resize-none rounded-xl border border-[#d3d3d3] bg-white px-3 py-2.5 text-sm leading-5 text-[#222] placeholder:text-[#999]`}
      />
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span id={helpId} className="text-xs text-[#777]">
          {note.length}/200자 · 비워서 저장하면 설명이 삭제됩니다.
        </span>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className={`${FOCUS_RING} min-h-10 cursor-pointer rounded-xl border border-[#d8d8d8] bg-white px-4 text-sm font-bold text-[#444] hover:bg-[#f4f4f4] disabled:cursor-not-allowed disabled:opacity-50`}
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSaving || normalizedNote === initialNote}
            className={`${FOCUS_RING} min-h-10 cursor-pointer rounded-xl bg-[#111] px-4 text-sm font-black text-white hover:bg-[#333] disabled:cursor-not-allowed disabled:bg-[#ccc]`}
          >
            {isSaving ? "저장 중" : "설명 저장"}
          </button>
        </div>
      </div>
    </form>
  );
}

function ActivityManager({
  activityTypes,
  onCreate,
  onToggle,
  isCreating,
  isActivityPending,
}: {
  activityTypes: TodayActivityType[];
  onCreate(body: CreateTodayActivityTypeBody): Promise<unknown>;
  onToggle(activity: TodayActivityType): void;
  isCreating: boolean;
  isActivityPending(activityId: string): boolean;
}) {
  const runSubmit = useSubmitLock();
  const [name, setName] = useState("");
  const [colorToken, setColorToken] = useState<TodayActivityColor>(
    TODAY_ACTIVITY_COLORS.blue
  );
  const [iconKey, setIconKey] = useState<TodayActivityIcon>(
    TODAY_ACTIVITY_ICONS.circle
  );
  return (
    <section className={`${SURFACE} p-5`} aria-label="활동 항목 관리">
      <h2 className="text-lg font-black tracking-[-0.03em]">활동 항목 관리</h2>
      <form
        className="mt-4 grid gap-2 sm:grid-cols-[minmax(160px,1fr)_130px_130px_auto]"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!name.trim() || isCreating) return;
          await runSubmit(async () => {
            try {
              await onCreate({ name: name.trim(), colorToken, iconKey });
              setName("");
            } catch {
              // mutation 상태가 오류 문구를 렌더하며 입력값은 재시도를 위해 유지한다.
            }
          });
        }}
      >
        <input
          value={name}
          maxLength={40}
          onChange={(event) => setName(event.target.value)}
          placeholder="새 활동 이름"
          aria-label="새 활동 이름"
          className={`${FOCUS_RING} h-11 rounded-xl border border-[#d8d8d8] px-3 text-sm`}
        />
        <select
          value={colorToken}
          onChange={(event) =>
            setColorToken(event.target.value as typeof colorToken)
          }
          aria-label="활동 색상"
          className={`${FOCUS_RING} h-11 rounded-xl border border-[#d8d8d8] px-3 text-sm font-bold`}
        >
          {Object.values(TODAY_ACTIVITY_COLORS).map((color) => (
            <option key={color} value={color}>
              {COLOR_LABEL[color]}
            </option>
          ))}
        </select>
        <select
          value={iconKey}
          onChange={(event) => setIconKey(event.target.value as typeof iconKey)}
          aria-label="활동 아이콘"
          className={`${FOCUS_RING} h-11 rounded-xl border border-[#d8d8d8] px-3 text-sm font-bold`}
        >
          {Object.values(TODAY_ACTIVITY_ICONS).map((icon) => (
            <option key={icon} value={icon}>
              {ICON_LABEL[icon]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={!name.trim() || isCreating}
          className={`${FOCUS_RING} h-11 rounded-xl bg-[#111] px-4 text-sm font-black text-white disabled:bg-[#ccc]`}
        >
          {isCreating ? "추가 중" : "추가"}
        </button>
      </form>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {activityTypes.map((activity) => (
          <li
            key={activity.id}
            className="flex items-center justify-between rounded-xl border border-[#e6e6e6] px-3 py-2.5"
          >
            <ActivityChip activity={activity} />
            <button
              type="button"
              disabled={isActivityPending(activity.id)}
              onClick={() => onToggle(activity)}
              className={`${FOCUS_RING} rounded-lg px-3 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50 ${activity.active ? "text-[#a33] hover:bg-[#fff3f2]" : "text-[#26724a] hover:bg-[#eef8f2]"}`}
            >
              {activity.active ? "숨기기" : "사용"}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ActivityChip({ activity }: { activity: TodayActivityType }) {
  const Icon = ICONS[activity.iconKey] ?? CircleDot;
  return (
    <span
      className={`inline-flex min-w-0 items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold ${COLOR_CLASS[activity.colorToken] ?? COLOR_CLASS.gray}`}
    >
      <Icon className="shrink-0" size={17} aria-hidden="true" />
      <span className="truncate">{activity.name}</span>
    </span>
  );
}
