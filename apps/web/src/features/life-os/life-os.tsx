"use client";
import { useEffect, useMemo, useState } from "react";
import type { LifeOsDayDto } from "@yeon/api-contract/life-os";
import { YeonButton, YeonField, YeonLabel, YeonText, YeonView } from "@yeon/ui";
import {
  createEmptyLifeOsEntries,
  LIFE_OS_HOUR_BLOCKS,
  LIFE_OS_ROWS,
} from "./constants";
import type { LifeOsHourEntry } from "./types";
import { fetchLifeOsDay, saveLifeOsDay } from "./life-os-fetch";
import { buildLifeOsReport, computeLifeOsDailyMetrics } from "./utils";
import {
  useYeonMutation as useMutation,
  useYeonQuery as useQuery,
  useYeonQueryClient as useQueryClient,
} from "@yeon/ui/runtime/YeonQuery";
import { lifeOsQueryKeys } from "@yeon/ui/runtime/ports/life-os";

type LifeOsDraft = {
  localDate: string;
  timezone: string;
  mindset: string;
  backlogText: string;
  entries: LifeOsHourEntry[];
};

type LifeOsViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; draft: LifeOsDraft };

const LIFE_OS_CLASS = {
  page: "min-h-screen bg-[#fafafa] p-6 text-[#111]",
  shell: "grid gap-4",
  header: "flex items-end justify-between gap-4",
  title: "m-0 text-[32px] font-extrabold",
  subtitle: "mb-0 mt-1 text-[#666]",
  headerActions: "flex items-center gap-2",
  dateInput:
    "rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-[9px] font-bold",
  saveButton: "cursor-pointer rounded-[10px] px-3 py-[9px] font-bold",
  statusText: "m-0 text-sm font-bold text-[#666]",
  canvasWrap:
    "overflow-x-auto border border-[#e5e5e5] bg-[#fafafa] shadow-[0_12px_40px_rgba(17,17,17,0.08)]",
  canvas: "grid min-w-[1400px] grid-cols-[280px_1fr_280px]",
  sheetBlock: {
    left: "grid auto-rows-[minmax(42px,auto)] border-r border-[#e5e5e5]",
    right: "grid auto-rows-[minmax(42px,auto)] border-l border-[#e5e5e5]",
  },
  dayBand:
    "border-b border-[#e5e5e5] bg-gradient-to-b from-[#fafafa] to-[#e5e5e5] px-2.5 py-2 font-bold",
  row: "grid grid-cols-[88px_repeat(8,minmax(0,1fr))] border-b border-[#e5e5e5]",
  rowLabel:
    "border-r border-[#e5e5e5] bg-[#fafafa] px-2.5 py-2 text-xs font-bold",
  cell: "min-h-[42px] border-r border-[#e5e5e5] px-2 py-1.5 text-xs",
  cellInput:
    "min-h-[30px] w-full resize-y border-0 bg-transparent p-0 leading-[1.25] text-inherit outline-none placeholder:text-[#aaa]",
  readOnlyCell: "font-extrabold text-[#111]",
  memoZone:
    "border-x border-[#e5e5e5] bg-gradient-to-b from-[#fafafa] to-white p-4",
  memoCard: "mb-3 block rounded-[14px] border border-[#e5e5e5] bg-white p-3.5",
  memoInput:
    "mt-2 min-h-24 w-full resize-y rounded-[10px] border border-[#e5e5e5] bg-white p-2.5 text-inherit placeholder:text-[#aaa]",
  reportPanel: "grid gap-3",
  reportCard: "mb-3 rounded-[14px] border border-[#e5e5e5] bg-white p-3.5",
} as const;

function getTodayLocalDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function toDraft(
  day?: LifeOsDayDto | null,
  localDate = getTodayLocalDate()
): LifeOsDraft {
  return {
    localDate: day?.localDate ?? localDate,
    timezone: day?.timezone ?? "Asia/Seoul",
    mindset: day?.mindset ?? "",
    backlogText: day?.backlogText ?? "",
    entries: normalizeEntries(day?.entries ?? createEmptyLifeOsEntries()),
  };
}

function normalizeEntries(entries: LifeOsHourEntry[]) {
  const byHour = new Map(entries.map((entry) => [entry.hour, entry]));
  return createEmptyLifeOsEntries().map((emptyEntry) => ({
    ...emptyEntry,
    ...byHour.get(emptyEntry.hour),
  }));
}

function toViewState(params: {
  isPending: boolean;
  error: Error | null;
  draft: LifeOsDraft;
}): LifeOsViewState {
  if (params.isPending) return { kind: "loading" };
  if (params.error) return { kind: "error", message: params.error.message };
  return { kind: "ready", draft: params.draft };
}

function getRowContent(row: (typeof LIFE_OS_ROWS)[number], hour: number) {
  if (row === "MINDSET") return hour === 0 ? "오늘의 기준" : "";
  if (row === "TIME") return `${hour}`;
  return null;
}

function DayBlock({
  side,
  draft,
  isDisabled,
  onEntryChange,
}: {
  side: "left" | "right";
  draft: LifeOsDraft;
  isDisabled: boolean;
  onEntryChange: (
    hour: number,
    field: "goalText" | "actionText",
    value: string
  ) => void;
}) {
  return (
    <YeonView
      as="section"
      className={LIFE_OS_CLASS.sheetBlock[side]}
      aria-label={`${side} day block`}
    >
      {LIFE_OS_HOUR_BLOCKS.map((block) => (
        <YeonView key={`${side}-${block.label}`}>
          <YeonView className={LIFE_OS_CLASS.dayBand}>
            {draft.localDate} · {side === "left" ? "기록" : "다음 기록"} ·{" "}
            {block.label}
          </YeonView>
          {LIFE_OS_ROWS.map((row) => (
            <YeonView
              className={LIFE_OS_CLASS.row}
              key={`${side}-${block.label}-${row}`}
            >
              <YeonView className={LIFE_OS_CLASS.rowLabel}>{row}</YeonView>
              {block.hours.map((hour) => {
                const entry =
                  draft.entries[hour] ?? createEmptyLifeOsEntries()[hour]!;
                const readOnlyContent = getRowContent(row, hour);
                const field =
                  row === "GOAL"
                    ? "goalText"
                    : row === "ACTION"
                      ? "actionText"
                      : null;

                return (
                  <YeonView
                    className={LIFE_OS_CLASS.cell}
                    key={`${side}-${block.label}-${row}-${hour}`}
                  >
                    {field ? (
                      <YeonField
                        as="textarea"
                        aria-label={`${draft.localDate} ${hour}시 ${row}`}
                        className={LIFE_OS_CLASS.cellInput}
                        disabled={isDisabled}
                        value={entry[field]}
                        onChange={(event) =>
                          onEntryChange(hour, field, event.target.value)
                        }
                        placeholder={row === "GOAL" ? "계획" : "실행"}
                      />
                    ) : (
                      <YeonText
                        as="span"
                        variant="unstyled"
                        tone="inherit"
                        className={LIFE_OS_CLASS.readOnlyCell}
                      >
                        {readOnlyContent}
                      </YeonText>
                    )}
                  </YeonView>
                );
              })}
            </YeonView>
          ))}
        </YeonView>
      ))}
    </YeonView>
  );
}

export function LifeOsScreen() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(getTodayLocalDate);
  const [draft, setDraft] = useState(() => toDraft(null, selectedDate));

  const dayQuery = useQuery({
    queryKey: lifeOsQueryKeys.day(selectedDate),
    queryFn: () => fetchLifeOsDay(selectedDate),
  });
  const saveMutation = useMutation({
    mutationFn: saveLifeOsDay,
    onSuccess(day) {
      queryClient.setQueryData(lifeOsQueryKeys.day(day.localDate), day);
      setDraft(toDraft(day, day.localDate));
    },
  });

  useEffect(() => {
    if (dayQuery.data) {
      setDraft(toDraft(dayQuery.data, selectedDate));
      return;
    }
    setDraft(toDraft(null, selectedDate));
  }, [dayQuery.data, selectedDate]);

  const viewState = toViewState({
    isPending: dayQuery.isPending,
    error: dayQuery.error,
    draft,
  });
  const report = useMemo(() => {
    const metrics = computeLifeOsDailyMetrics({
      localDate: draft.localDate,
      entries: draft.entries,
    });
    return buildLifeOsReport({
      periodType: "daily",
      periodStart: draft.localDate,
      periodEnd: draft.localDate,
      metrics,
    });
  }, [draft]);
  const isEntryDisabled =
    viewState.kind === "loading" || saveMutation.isPending;
  const isSaveDisabled = isEntryDisabled;
  const saveButtonLabel = saveMutation.isPending ? "저장 중" : "저장";
  const saveStatusText = saveMutation.isError
    ? saveMutation.error.message
    : saveMutation.isSuccess
      ? "저장되었습니다."
      : null;

  function handleEntryChange(
    hour: number,
    field: "goalText" | "actionText",
    value: string
  ) {
    setDraft((current) => ({
      ...current,
      entries: current.entries.map((entry) =>
        entry.hour === hour ? { ...entry, [field]: value } : entry
      ),
    }));
  }

  function handleSave() {
    saveMutation.mutate(draft);
  }

  return (
    <YeonView as="main" className={LIFE_OS_CLASS.page}>
      <YeonView className={LIFE_OS_CLASS.shell}>
        <YeonView as="header" className={LIFE_OS_CLASS.header}>
          <YeonView>
            <YeonText
              as="h1"
              variant="unstyled"
              tone="inherit"
              className={LIFE_OS_CLASS.title}
            >
              Life OS
            </YeonText>
            <YeonText
              variant="unstyled"
              tone="inherit"
              className={LIFE_OS_CLASS.subtitle}
            >
              스프레드시트처럼 시간별 GOAL/ACTION을 직접 기록하고, 과계획 신호를
              리포트로 전환합니다.
            </YeonText>
          </YeonView>
          <YeonView className={LIFE_OS_CLASS.headerActions}>
            <YeonField
              className={LIFE_OS_CLASS.dateInput}
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
            <YeonButton
              className={LIFE_OS_CLASS.saveButton}
              type="button"
              disabled={isSaveDisabled}
              onClick={handleSave}
              variant="primary"
            >
              {saveButtonLabel}
            </YeonButton>
          </YeonView>
        </YeonView>

        {viewState.kind === "loading" ? (
          <YeonText
            variant="unstyled"
            tone="inherit"
            className={LIFE_OS_CLASS.statusText}
          >
            기록을 불러오는 중입니다.
          </YeonText>
        ) : null}
        {viewState.kind === "error" ? (
          <YeonText
            variant="unstyled"
            tone="inherit"
            className={LIFE_OS_CLASS.statusText}
          >
            {viewState.message}
          </YeonText>
        ) : null}
        {saveStatusText ? (
          <YeonText
            variant="unstyled"
            tone="inherit"
            className={LIFE_OS_CLASS.statusText}
          >
            {saveStatusText}
          </YeonText>
        ) : null}

        <YeonView className={LIFE_OS_CLASS.canvasWrap}>
          <YeonView className={LIFE_OS_CLASS.canvas}>
            <DayBlock
              side="left"
              draft={draft}
              isDisabled={isEntryDisabled}
              onEntryChange={handleEntryChange}
            />

            <YeonView
              as="section"
              className={LIFE_OS_CLASS.memoZone}
              aria-label="central memo backlog"
            >
              <YeonLabel className={LIFE_OS_CLASS.memoCard}>
                <YeonText as="strong" variant="unstyled" tone="inherit">
                  MINDSET
                </YeonText>
                <YeonField
                  as="textarea"
                  className={LIFE_OS_CLASS.memoInput}
                  disabled={isEntryDisabled}
                  value={draft.mindset}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      mindset: event.target.value,
                    }))
                  }
                  placeholder="오늘 판단 기준, 버릴 것, 지킬 것"
                />
              </YeonLabel>
              <YeonLabel className={LIFE_OS_CLASS.memoCard}>
                <YeonText as="strong" variant="unstyled" tone="inherit">
                  Memo / Backlog
                </YeonText>
                <YeonField
                  as="textarea"
                  className={LIFE_OS_CLASS.memoInput}
                  disabled={isEntryDisabled}
                  value={draft.backlogText}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      backlogText: event.target.value,
                    }))
                  }
                  placeholder="중앙 여백처럼 아직 시간표에 넣지 않을 생각을 보관"
                />
              </YeonLabel>
              <YeonView className={LIFE_OS_CLASS.reportPanel}>
                <YeonView className={LIFE_OS_CLASS.reportCard}>
                  <YeonText as="strong" variant="unstyled" tone="inherit">
                    Daily report
                  </YeonText>
                  <YeonText variant="unstyled" tone="inherit">
                    planned: {report.metrics.plannedHours}h · matched:{" "}
                    {report.metrics.matchedHours}h · overplanned:{" "}
                    {report.metrics.overplannedHours}h
                  </YeonText>
                </YeonView>
                <YeonView className={LIFE_OS_CLASS.reportCard}>
                  <YeonText as="strong" variant="unstyled" tone="inherit">
                    Pattern evidence
                  </YeonText>
                  <YeonText variant="unstyled" tone="inherit">
                    {report.patterns[0]?.evidence ??
                      "아직 반복 패턴을 판단할 기록이 부족합니다."}
                  </YeonText>
                </YeonView>
                <YeonView className={LIFE_OS_CLASS.reportCard}>
                  <YeonText as="strong" variant="unstyled" tone="inherit">
                    Next adjustment
                  </YeonText>
                  <YeonText variant="unstyled" tone="inherit">
                    {report.recommendations[0]?.suggestedAdjustment ??
                      "GOAL/ACTION을 최소 4칸 이상 기록하세요."}
                  </YeonText>
                </YeonView>
              </YeonView>
            </YeonView>

            <DayBlock
              side="right"
              draft={draft}
              isDisabled={isEntryDisabled}
              onEntryChange={handleEntryChange}
            />
          </YeonView>
        </YeonView>
      </YeonView>
    </YeonView>
  );
}
