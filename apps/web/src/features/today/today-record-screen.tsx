"use client";

import {
  BookOpen,
  Car,
  Check,
  CircleDot,
  Coffee,
  Dumbbell,
  Gamepad2,
  MoreHorizontal,
  Moon,
  PencilLine,
  Plus,
  Settings2,
  Trash2,
  Utensils,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  TODAY_ACTIVITY_COLORS,
  TODAY_ACTIVITY_ICONS,
  type CreateTodayActivityTypeBody,
  type TodayActivityType,
  type TodayRecordEntry,
  type TodayRecordResponse,
} from "@yeon/api-contract/today";
import { YeonContextMenu, type YeonContextMenuItem } from "@yeon/ui";
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

const TEXT_COLOR_CLASS = {
  blue: "text-[#155fa8]",
  green: "text-[#26724a]",
  orange: "text-[#a95b17]",
  purple: "text-[#6742a0]",
  yellow: "text-[#876a13]",
  red: "text-[#a93d31]",
  gray: "text-[#555]",
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

type EditingRecordEntry = {
  hour: number;
  entryIndex: number;
};

type RecordContextMenuState =
  | (EditingRecordEntry & {
      target: "entry";
      position: {
        x: number;
        y: number;
      };
    })
  | {
      target: "slot";
      hour: number;
      position: {
        x: number;
        y: number;
      };
    };

function getSlotEntries(
  slot: TodayRecordResponse["slots"][number]
): TodayRecordEntry[] {
  if (slot.entries.length > 0) {
    return [...slot.entries].sort(
      (left, right) => left.entryIndex - right.entryIndex
    );
  }
  return slot.activityType
    ? [
        {
          entryIndex: 0,
          activityType: slot.activityType,
          note: slot.note,
        },
      ]
    : [];
}

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
  const [editingEntry, setEditingEntry] = useState<EditingRecordEntry | null>(
    null
  );
  const [contextMenu, setContextMenu] = useState<RecordContextMenuState | null>(
    null
  );
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

  useEffect(() => {
    setEditingEntry(null);
    setContextMenu(null);
  }, [date]);

  const editingSlot =
    editingEntry === null
      ? null
      : (record.slots.find((slot) => slot.hour === editingEntry.hour) ?? null);
  const selectedEntry =
    editingSlot && editingEntry
      ? (getSlotEntries(editingSlot).find(
          (entry) => entry.entryIndex === editingEntry.entryIndex
        ) ?? null)
      : null;
  const deleteEntry = async (hour: number, entryIndex: number) => {
    mutations.resetErrors();
    await slotCommands.run(hour, () =>
      mutations.deleteSlot.mutateAsync({
        hour,
        entryIndex,
      })
    );
    if (editingEntry?.hour === hour && editingEntry.entryIndex === entryIndex) {
      setEditingEntry(null);
    }
  };
  const contextMenuSlot = contextMenu
    ? (record.slots.find((slot) => slot.hour === contextMenu.hour) ?? null)
    : null;
  const contextMenuEntries = contextMenuSlot
    ? getSlotEntries(contextMenuSlot)
    : [];
  const contextMenuEntry =
    contextMenu?.target === "entry"
      ? (contextMenuEntries.find(
          (entry) => entry.entryIndex === contextMenu.entryIndex
        ) ?? null)
      : null;
  const createEntryMenuItems = (
    hour: number,
    entry: TodayRecordEntry,
    includeActivityName = false
  ): YeonContextMenuItem[] => {
    const labelPrefix = includeActivityName
      ? `${entry.activityType.name} · `
      : "";
    return [
      {
        key: `edit-note-${entry.entryIndex}`,
        label: `${labelPrefix}설명 편집`,
        icon: <PencilLine size={15} aria-hidden="true" />,
        disabled: slotCommands.isLocked(hour),
        onSelect: () =>
          setEditingEntry({
            hour,
            entryIndex: entry.entryIndex,
          }),
      },
      {
        key: `delete-record-${entry.entryIndex}`,
        label: `${labelPrefix}기록 삭제`,
        icon: <Trash2 size={15} aria-hidden="true" />,
        destructive: true,
        disabled: slotCommands.isLocked(hour),
        onSelect: () =>
          deleteEntry(hour, entry.entryIndex).catch(() => undefined),
      },
    ];
  };
  const contextMenuItems =
    contextMenu?.target === "slot"
      ? contextMenuEntries.flatMap((entry) =>
          createEntryMenuItems(contextMenu.hour, entry, true)
        )
      : contextMenu?.target === "entry" && contextMenuEntry
        ? createEntryMenuItems(contextMenu.hour, contextMenuEntry)
        : [];

  return (
    <div className="space-y-4">
      <section className={`${SURFACE} p-4 sm:p-5`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black tracking-[-0.03em]">활동 선택</h2>
            <p className="mt-1 text-sm text-[#666]">
              활동을 고른 뒤 시간 블록을 누르세요. 한 번 더 누르면 두 번째
              활동을 기록합니다.
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
              actionDisabled={slotCommands.isLocked(slot.hour)}
              onAppend={() => {
                if (selectedActivityId) {
                  mutations.resetErrors();
                  void slotCommands
                    .run(slot.hour, () =>
                      mutations.upsertSlot.mutateAsync({
                        hour: slot.hour,
                        activityTypeId: selectedActivityId,
                      })
                    )
                    .catch(() => undefined);
                }
              }}
              onOpenMenu={(entryIndex, position) =>
                setContextMenu({
                  target: "entry",
                  hour: slot.hour,
                  entryIndex,
                  position,
                })
              }
              onOpenSlotMenu={(position) =>
                setContextMenu({
                  target: "slot",
                  hour: slot.hour,
                  position,
                })
              }
            />
          ))}
        </div>
        {contextMenu ? (
          <YeonContextMenu
            position={contextMenu.position}
            ariaLabel={`${contextMenu.hour}시 기록 메뉴`}
            onClose={() => setContextMenu(null)}
            items={contextMenuItems}
          />
        ) : null}
        {editingSlot && selectedEntry ? (
          <SlotEntryEditor
            key={`${date}-${editingSlot.hour}-${selectedEntry.entryIndex}-${selectedEntry.activityType.id}`}
            hour={editingSlot.hour}
            entry={selectedEntry}
            activityTypes={activeTypes}
            isPending={slotCommands.isLocked(editingSlot.hour)}
            onCancel={() => setEditingEntry(null)}
            onSave={async (activityTypeId, note) => {
              mutations.resetErrors();
              await slotCommands.run(editingSlot.hour, () =>
                mutations.upsertSlot.mutateAsync({
                  hour: editingSlot.hour,
                  entryIndex: selectedEntry.entryIndex,
                  activityTypeId,
                  note,
                })
              );
              setEditingEntry(null);
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
  actionDisabled,
  onAppend,
  onOpenMenu,
  onOpenSlotMenu,
}: {
  slot: TodayRecordResponse["slots"][number];
  disabled: boolean;
  actionDisabled: boolean;
  onAppend(): void;
  onOpenMenu(
    entryIndex: number,
    position: RecordContextMenuState["position"]
  ): void;
  onOpenSlotMenu(position: RecordContextMenuState["position"]): void;
}) {
  const entries = getSlotEntries(slot);
  const openMenuFromButton = (
    event: ReactMouseEvent<HTMLButtonElement>,
    entryIndex: number
  ) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    onOpenMenu(entryIndex, {
      x: rect.right,
      y: rect.bottom + 4,
    });
  };
  const openMenuFromPointer = (
    event: ReactMouseEvent<HTMLElement>,
    entryIndex: number
  ) => {
    event.preventDefault();
    onOpenMenu(entryIndex, {
      x: event.clientX,
      y: event.clientY,
    });
  };
  const openSlotMenuFromButton = (
    event: ReactMouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    onOpenSlotMenu({
      x: rect.right,
      y: rect.bottom + 4,
    });
  };

  if (entries.length === 0) {
    return (
      <div className="relative flex min-h-32 flex-col rounded-xl border border-[#e2e2e2] bg-[#fafafa] p-2 text-[#999] transition-colors hover:border-[#aaa] hover:bg-white">
        <button
          type="button"
          disabled={disabled}
          onClick={onAppend}
          aria-label={`${slot.hour}시, 기록 없음. 선택한 활동으로 기록`}
          className={`${FOCUS_RING} flex min-h-0 flex-1 cursor-pointer flex-col items-center justify-center rounded-lg disabled:cursor-not-allowed`}
        >
          <HourLabel hour={slot.hour} />
          <Plus size={22} aria-hidden="true" />
          <span className="mt-1 text-[11px] font-bold">기록</span>
        </button>
      </div>
    );
  }

  if (entries.length === 1) {
    const entry = entries[0]!;
    const Icon = ICONS[entry.activityType.iconKey] ?? CircleDot;
    return (
      <div
        onContextMenu={(event) => openMenuFromPointer(event, entry.entryIndex)}
        className={`group relative flex min-h-32 flex-col rounded-xl border p-2 transition-colors ${COLOR_CLASS[entry.activityType.colorToken] ?? COLOR_CLASS.gray}`}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={onAppend}
          aria-label={`${slot.hour}시, ${entry.activityType.name}${entry.note ? `, 설명 ${entry.note}` : ""}. 선택한 활동을 두 번째 기록으로 추가`}
          title="클릭하면 두 번째 기록 추가 · 오른쪽 클릭하면 기록 메뉴"
          className={`${FOCUS_RING} flex min-h-0 flex-1 cursor-pointer flex-col items-center justify-center rounded-lg px-1 disabled:cursor-not-allowed`}
        >
          <HourLabel hour={slot.hour} />
          <Icon size={22} aria-hidden="true" />
          <span className="mt-1 max-w-full truncate text-[11px] font-bold">
            {entry.activityType.name}
          </span>
          <span className="mt-0.5 max-w-full truncate text-[9px] font-semibold opacity-70">
            {entry.note ?? "설명 없음"}
          </span>
        </button>
        <button
          type="button"
          disabled={actionDisabled}
          onClick={(event) => openMenuFromButton(event, entry.entryIndex)}
          aria-label={`${slot.hour}시 ${entry.activityType.name} 기록 메뉴 열기`}
          aria-haspopup="menu"
          title="기록 메뉴"
          className={`${FOCUS_RING} absolute right-1.5 top-1.5 z-20 grid size-7 cursor-pointer place-items-center rounded-lg bg-white/80 opacity-100 shadow-sm hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100`}
        >
          <MoreHorizontal size={15} aria-hidden="true" />
        </button>
      </div>
    );
  }

  const [firstEntry, secondEntry] = entries;
  return (
    <div className="group relative min-h-32 overflow-hidden rounded-xl border border-[#cfcfcf] bg-white">
      <SplitEntryTriangle
        hour={slot.hour}
        entry={firstEntry!}
        position="first"
        disabled={actionDisabled}
        onOpenMenu={onOpenMenu}
      />
      <SplitEntryTriangle
        hour={slot.hour}
        entry={secondEntry!}
        position="second"
        disabled={actionDisabled}
        onOpenMenu={onOpenMenu}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(to bottom right, transparent calc(50% - 0.75px), rgba(17, 17, 17, 0.32) 50%, transparent calc(50% + 0.75px))",
        }}
      />
      <HourLabel hour={slot.hour} emphasized />
      <button
        type="button"
        disabled={actionDisabled}
        aria-label={`${slot.hour}시 기록 메뉴 열기`}
        aria-haspopup="menu"
        title="두 기록 메뉴"
        onClick={openSlotMenuFromButton}
        className={`${FOCUS_RING} absolute right-1.5 top-1.5 z-20 grid size-7 cursor-pointer place-items-center rounded-lg bg-white/90 shadow-sm hover:bg-white disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <MoreHorizontal size={14} aria-hidden="true" />
      </button>
    </div>
  );
}

function SplitEntryTriangle({
  hour,
  entry,
  position,
  disabled,
  onOpenMenu,
}: {
  hour: number;
  entry: TodayRecordEntry;
  position: "first" | "second";
  disabled: boolean;
  onOpenMenu(
    entryIndex: number,
    position: RecordContextMenuState["position"]
  ): void;
}) {
  const positionLabel = position === "first" ? "첫 번째" : "두 번째";
  const Icon = ICONS[entry.activityType.iconKey] ?? CircleDot;
  return (
    <>
      <div
        role="group"
        aria-label={`${hour}시 ${positionLabel} 기록, ${entry.activityType.name}${entry.note ? `, 설명 ${entry.note}` : ", 설명 없음"}`}
        title={`${entry.activityType.name} · ${entry.note ?? "설명 없음"} · 오른쪽 클릭하여 메뉴 열기`}
        onContextMenu={(event) => {
          event.preventDefault();
          onOpenMenu(entry.entryIndex, {
            x: event.clientX,
            y: event.clientY,
          });
        }}
        className={`absolute inset-0 transition-[filter] hover:brightness-[0.97] ${disabled ? "opacity-60" : ""} ${COLOR_CLASS[entry.activityType.colorToken] ?? COLOR_CLASS.gray}`}
        style={{
          clipPath:
            position === "first"
              ? "polygon(0 0, 100% 0, 0 100%)"
              : "polygon(100% 0, 100% 100%, 0 100%)",
        }}
      />
      <span
        className={`pointer-events-none absolute z-10 flex w-14 -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center font-bold leading-tight ${
          position === "first" ? "left-1/3 top-1/3" : "left-2/3 top-2/3"
        } ${disabled ? "opacity-60" : ""} ${TEXT_COLOR_CLASS[entry.activityType.colorToken] ?? TEXT_COLOR_CLASS.gray}`}
      >
        <span className="flex max-w-full items-center justify-center gap-1">
          <Icon size={15} className="shrink-0" aria-hidden="true" />
          <span className="max-w-full truncate text-[10px]">
            {entry.activityType.name}
          </span>
        </span>
        <span className="mt-1 max-w-full truncate text-[8px] font-semibold opacity-75">
          {entry.note ?? "설명 추가"}
        </span>
      </span>
    </>
  );
}

function HourLabel({
  hour,
  emphasized = false,
}: {
  hour: number;
  emphasized?: boolean;
}) {
  return (
    <span
      className={`absolute left-2 top-2 z-20 text-[11px] font-black tabular-nums ${emphasized ? "rounded bg-white/80 px-1 text-[#333] shadow-sm" : ""}`}
    >
      {String(hour).padStart(2, "0")}
    </span>
  );
}

function SlotEntryEditor({
  hour,
  entry,
  activityTypes,
  isPending,
  onSave,
  onCancel,
}: {
  hour: number;
  entry: TodayRecordEntry;
  activityTypes: TodayActivityType[];
  isPending: boolean;
  onSave(activityTypeId: string, note: string | null): Promise<unknown>;
  onCancel(): void;
}) {
  const [note, setNote] = useState(entry.note ?? "");
  const [activityTypeId, setActivityTypeId] = useState(entry.activityType.id);
  const normalizedNote = note.trim();
  const initialNote = (entry.note ?? "").trim();
  const inputId = `slot-note-${hour}-${entry.entryIndex}`;
  const helpId = `${inputId}-help`;
  const positionLabel = entry.entryIndex === 0 ? "첫 번째" : "두 번째";
  const activityOptions = activityTypes.some(
    (activity) => activity.id === entry.activityType.id
  )
    ? activityTypes
    : [entry.activityType, ...activityTypes];

  return (
    <form
      aria-label={`${hour}시 ${positionLabel} 기록 설명 편집`}
      className="mt-3 rounded-xl border border-[#d8d8d8] bg-[#fafafa] p-2.5"
      onSubmit={async (event) => {
        event.preventDefault();
        try {
          await onSave(activityTypeId, normalizedNote || null);
        } catch {
          // 상위 mutation 오류 영역을 유지하고 사용자의 입력도 보존한다.
        }
      }}
    >
      <div className="grid gap-2 sm:grid-cols-[auto_minmax(120px,180px)_minmax(0,1fr)_auto] sm:items-center">
        <span className="whitespace-nowrap px-1 text-xs font-black text-[#444]">
          {String(hour).padStart(2, "0")}시 · {positionLabel}
        </span>
        <label htmlFor={`${inputId}-activity`} className="sr-only">
          활동
        </label>
        <select
          id={`${inputId}-activity`}
          value={activityTypeId}
          disabled={isPending}
          onChange={(event) => setActivityTypeId(event.target.value)}
          className={`${FOCUS_RING} h-9 w-full rounded-lg border border-[#d3d3d3] bg-white px-2.5 text-sm font-bold text-[#222] disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {activityOptions.map((activity) => (
            <option key={activity.id} value={activity.id}>
              {activity.name}
            </option>
          ))}
        </select>
        <div className="relative min-w-0">
          <label htmlFor={inputId} className="sr-only">
            설명
          </label>
          <input
            id={inputId}
            value={note}
            maxLength={200}
            autoFocus
            aria-describedby={helpId}
            onChange={(event) => setNote(event.target.value)}
            placeholder="설명 추가 (선택)"
            className={`${FOCUS_RING} h-9 w-full rounded-lg border border-[#d3d3d3] bg-white px-2.5 pr-14 text-sm text-[#222] placeholder:text-[#999]`}
          />
          <span
            id={helpId}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] tabular-nums text-[#888]"
          >
            {note.length}/200
          </span>
        </div>
        <div className="flex justify-end gap-1.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className={`${FOCUS_RING} inline-flex h-9 cursor-pointer items-center gap-1 rounded-lg border border-[#d8d8d8] bg-white px-3 text-xs font-bold text-[#555] hover:bg-[#f4f4f4] disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <X size={14} aria-hidden="true" />
            취소
          </button>
          <button
            type="submit"
            disabled={
              isPending ||
              (normalizedNote === initialNote &&
                activityTypeId === entry.activityType.id)
            }
            className={`${FOCUS_RING} inline-flex h-9 cursor-pointer items-center gap-1 rounded-lg bg-[#111] px-3 text-xs font-black text-white hover:bg-[#333] disabled:cursor-not-allowed disabled:bg-[#ccc]`}
          >
            <Check size={14} aria-hidden="true" />
            {isPending ? "저장 중" : "저장"}
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
