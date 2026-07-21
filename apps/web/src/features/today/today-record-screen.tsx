"use client";

import {
  BookOpen,
  Car,
  CircleDot,
  Coffee,
  Dumbbell,
  Gamepad2,
  Moon,
  Plus,
  Settings2,
  Trash2,
  Utensils,
} from "lucide-react";
import { useEffect, useState, type ComponentType } from "react";
import type {
  TodayActivityType,
  TodayRecordResponse,
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
  useTodayActivityTypes,
  useTodayCalendar,
  useTodayRecord,
  useTodayRecordMutations,
} from "@/features/today/use-today-data";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111] focus-visible:ring-offset-2";
const SURFACE = "rounded-2xl border border-[#dedede] bg-white";

const COLOR_CLASS: Record<string, string> = {
  blue: "border-[#b9d7ff] bg-[#eaf4ff] text-[#155fa8]",
  green: "border-[#b9e2cc] bg-[#ecf8f1] text-[#26724a]",
  orange: "border-[#ffd3ab] bg-[#fff3e6] text-[#a95b17]",
  purple: "border-[#dac7f4] bg-[#f4edfc] text-[#6742a0]",
  yellow: "border-[#f1dda1] bg-[#fff8dc] text-[#876a13]",
  red: "border-[#fac3bd] bg-[#fff0ee] text-[#a93d31]",
  gray: "border-[#d6d6d6] bg-[#f2f2f2] text-[#555]",
};

const ICONS: Record<
  string,
  ComponentType<{ size?: number; className?: string }>
> = {
  book: BookOpen,
  gamepad: Gamepad2,
  utensils: Utensils,
  car: Car,
  coffee: Coffee,
  moon: Moon,
  dumbbell: Dumbbell,
  circle: CircleDot,
};

export function TodayRecordScreen() {
  const searchParams = useYeonSearchParams();
  const router = useYeonRouter();
  const date = normalizeDate(searchParams.get("date"));
  const [visibleMonth, setVisibleMonth] = useState(toMonth(date));
  const recordQuery = useTodayRecord(date);
  const activityTypesQuery = useTodayActivityTypes();
  const calendarQuery = useTodayCalendar(visibleMonth);

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
      totalCount={24}
      completedCount={record?.summary.recordedHours ?? 0}
      estimatedMinutes={(record?.summary.recordedHours ?? 0) * 60}
    >
      {recordQuery.isPending || activityTypesQuery.isPending ? (
        <TodayLoadingState />
      ) : null}
      {recordQuery.isError || activityTypesQuery.isError ? (
        <TodayErrorState
          message={getTodayErrorMessage(
            recordQuery.error ?? activityTypesQuery.error
          )}
        />
      ) : null}
      {record && activityTypesQuery.data ? (
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
  const activeTypes = activityTypes.filter((activity) => activity.active);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    activeTypes[0]?.id ?? null
  );
  const [manageOpen, setManageOpen] = useState(false);
  const mutations = useTodayRecordMutations(date);
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
          className="mt-4 flex gap-2 overflow-x-auto pb-1"
          role="listbox"
          aria-label="기록할 활동"
        >
          {activeTypes.map((activity) => (
            <ActivityButton
              key={activity.id}
              activity={activity}
              selected={selectedActivityId === activity.id}
              onClick={() => setSelectedActivityId(activity.id)}
            />
          ))}
        </div>
      </section>

      {manageOpen ? (
        <ActivityManager
          activityTypes={activityTypes}
          onCreate={mutations.createActivityType.mutateAsync}
          onToggle={(activity) =>
            mutations.updateActivityType.mutate({
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
          }
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
              disabled={!selectedActivityId || mutations.upsertSlot.isPending}
              onAssign={() => {
                if (selectedActivityId) {
                  mutations.upsertSlot.mutate({
                    hour: slot.hour,
                    activityTypeId: selectedActivityId,
                  });
                }
              }}
              onClear={() => mutations.deleteSlot.mutate(slot.hour)}
            />
          ))}
        </div>
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
  onAssign,
  onClear,
}: {
  slot: TodayRecordResponse["slots"][number];
  disabled: boolean;
  onAssign(): void;
  onClear(): void;
}) {
  const Icon = slot.activityType
    ? (ICONS[slot.activityType.iconKey] ?? CircleDot)
    : Plus;
  return (
    <div
      className={`group relative flex aspect-square min-h-[82px] flex-col rounded-xl border p-2 transition-colors ${slot.activityType ? (COLOR_CLASS[slot.activityType.colorToken] ?? COLOR_CLASS.gray) : "border-[#e2e2e2] bg-[#fafafa] text-[#999] hover:border-[#aaa] hover:bg-white"}`}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={onAssign}
        aria-label={`${slot.hour}시, ${slot.activityType?.name ?? "기록 없음"}. 선택한 활동으로 기록`}
        className={`${FOCUS_RING} flex h-full flex-col items-center justify-center rounded-lg disabled:cursor-not-allowed`}
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
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onClear();
          }}
          aria-label={`${slot.hour}시 기록 삭제`}
          className={`${FOCUS_RING} absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-lg bg-white/80 opacity-100 shadow-sm hover:bg-white sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100`}
        >
          <Trash2 size={13} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

function ActivityManager({
  activityTypes,
  onCreate,
  onToggle,
}: {
  activityTypes: TodayActivityType[];
  onCreate(body: {
    name: string;
    colorToken:
      | "blue"
      | "green"
      | "orange"
      | "purple"
      | "yellow"
      | "red"
      | "gray";
    iconKey:
      | "book"
      | "gamepad"
      | "utensils"
      | "car"
      | "coffee"
      | "moon"
      | "dumbbell"
      | "circle";
  }): Promise<unknown>;
  onToggle(activity: TodayActivityType): void;
}) {
  const [name, setName] = useState("");
  const [colorToken, setColorToken] = useState<
    "blue" | "green" | "orange" | "purple" | "yellow" | "red" | "gray"
  >("blue");
  const [iconKey, setIconKey] = useState<
    | "book"
    | "gamepad"
    | "utensils"
    | "car"
    | "coffee"
    | "moon"
    | "dumbbell"
    | "circle"
  >("circle");
  return (
    <section className={`${SURFACE} p-5`} aria-label="활동 항목 관리">
      <h2 className="text-lg font-black tracking-[-0.03em]">활동 항목 관리</h2>
      <form
        className="mt-4 grid gap-2 sm:grid-cols-[minmax(160px,1fr)_130px_130px_auto]"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!name.trim()) return;
          try {
            await onCreate({ name: name.trim(), colorToken, iconKey });
            setName("");
          } catch {
            // mutation 상태가 오류 문구를 렌더하며 입력값은 재시도를 위해 유지한다.
          }
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
          {Object.keys(COLOR_CLASS).map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </select>
        <select
          value={iconKey}
          onChange={(event) => setIconKey(event.target.value as typeof iconKey)}
          aria-label="활동 아이콘"
          className={`${FOCUS_RING} h-11 rounded-xl border border-[#d8d8d8] px-3 text-sm font-bold`}
        >
          {Object.keys(ICONS).map((icon) => (
            <option key={icon} value={icon}>
              {icon}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={!name.trim()}
          className={`${FOCUS_RING} h-11 rounded-xl bg-[#111] px-4 text-sm font-black text-white disabled:bg-[#ccc]`}
        >
          추가
        </button>
      </form>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {activityTypes.map((activity) => (
          <li
            key={activity.id}
            className="flex items-center justify-between rounded-xl border border-[#e6e6e6] px-3 py-2.5"
          >
            <ActivityButton
              activity={activity}
              selected={false}
              onClick={() => undefined}
            />
            <button
              type="button"
              onClick={() => onToggle(activity)}
              className={`${FOCUS_RING} rounded-lg px-3 py-2 text-xs font-bold ${activity.active ? "text-[#a33] hover:bg-[#fff3f2]" : "text-[#26724a] hover:bg-[#eef8f2]"}`}
            >
              {activity.active ? "숨기기" : "사용"}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
