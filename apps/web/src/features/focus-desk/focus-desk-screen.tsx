"use client";

import {
  BookOpen,
  CheckCircle2,
  Clock3,
  ListTodo,
  RotateCcw,
  Timer,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type {
  CardDeckDto,
  CardDeckItemDto,
  CardReviewDifficulty,
} from "@yeon/api-contract/card-decks";
import { createYeonUrlSearchParams } from "@yeon/ui/runtime/YeonBrowserRuntime";
import {
  useYeonPathname,
  useYeonRouter,
  useYeonSearchParams,
} from "@yeon/ui/runtime/YeonNavigation";
import { resolveYeonWebPath } from "@yeon/ui/runtime/ports";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import {
  YeonButton,
  YeonLink,
  YeonSurface,
  YeonText,
  YeonView,
  YEON_WEB_SHADOW_CLASS,
} from "@yeon/ui";
import { CommonProductHeader } from "@/components/product-shell/product-header";
import { DeckPlayReviewModeCard } from "@/features/card-service/components";
import { CARD_SERVICE_COMMON_CLASS } from "@/features/card-service/card-service-common.const";
import {
  useDeckDetail,
  useDeckList,
  useReviewCardWithDeckDetailCache,
} from "@/features/card-service/hooks";
import { resolveTodoServiceHref } from "@/lib/study-desk-links";
import {
  FOCUS_DESK_MODES,
  FOCUS_DESK_SESSION_MINUTES,
  applyFocusDeskReviewResult,
  applyFocusDeskSkip,
  buildFocusDeskStudyQueue,
  createFocusDeskSummary,
  createInitialFocusDeskStats,
  getNextFocusDeskCardIndex,
  parseFocusDeskMode,
  parseFocusDeskSessionMinutes,
  type FocusDeskMode,
  type FocusDeskReviewStats,
  type FocusDeskSessionMinutes,
  type FocusDeskSummary,
} from "./focus-desk-session";

type FocusDeskSessionStatus = "setup" | "running" | "finished";

const FOCUS_DESK_MODE_OPTIONS: Array<{
  mode: FocusDeskMode;
  label: string;
  description: string;
}> = [
  {
    mode: FOCUS_DESK_MODES.review,
    label: "복습 우선",
    description: "어려움·복습 예정 카드를 먼저 봅니다.",
  },
  {
    mode: FOCUS_DESK_MODES.all,
    label: "전체 훑기",
    description: "덱의 현재 순서대로 진행합니다.",
  },
  {
    mode: FOCUS_DESK_MODES.exam,
    label: "시험 직전",
    description: "어려운 카드와 미복습 카드를 앞에 둡니다.",
  },
];

function normalizeQueryText(value: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function formatRemainingSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatElapsedSeconds(totalSeconds: number) {
  if (totalSeconds < 60) return `${totalSeconds}초`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return seconds === 0 ? `${minutes}분` : `${minutes}분 ${seconds}초`;
}

function DeckOptionCard({
  deck,
  disabled,
  selected,
  onSelect,
}: {
  deck: CardDeckDto;
  disabled: boolean;
  selected: boolean;
  onSelect: (deckId: string) => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      onClick={() => onSelect(deck.id)}
      className={`rounded-lg border bg-white p-4 text-left transition-colors hover:border-[#111] disabled:cursor-not-allowed disabled:opacity-60 ${
        selected ? "border-[#111]" : "border-[#e5e5e5]"
      }`}
    >
      <YeonView className="flex items-start justify-between gap-3">
        <YeonView className="min-w-0">
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className="block truncate text-[15px] font-bold text-[#111]"
          >
            {deck.title}
          </YeonText>
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className="mt-2 block text-[12px] font-medium text-[#666]"
          >
            카드 {deck.itemCount}장
          </YeonText>
        </YeonView>
        {selected ? <CheckCircle2 aria-hidden="true" size={18} /> : null}
      </YeonView>
    </button>
  );
}

function SegmentButton({
  children,
  disabled,
  selected,
  onClick,
}: {
  children: ReactNode;
  disabled: boolean;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg border px-4 py-3 text-[13px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        selected
          ? "border-[#111] bg-[#111] text-white"
          : "border-[#e5e5e5] bg-white text-[#111] hover:border-[#111]"
      }`}
    >
      {children}
    </button>
  );
}

function RunningSessionPanel({
  mode,
  queueLength,
  remainingSeconds,
  selectedDeck,
  stats,
  onFinish,
}: {
  mode: FocusDeskMode;
  queueLength: number;
  remainingSeconds: number;
  selectedDeck: CardDeckDto | null;
  stats: FocusDeskReviewStats;
  onFinish: () => void;
}) {
  const modeLabel =
    FOCUS_DESK_MODE_OPTIONS.find((option) => option.mode === mode)?.label ??
    "복습 우선";
  const completedCount = Math.min(stats.reviewed + stats.skipped, queueLength);
  const progressPercent =
    queueLength === 0 ? 0 : Math.round((completedCount / queueLength) * 100);

  return (
    <YeonSurface className="border-[#111] p-5">
      <YeonView className="flex items-start justify-between gap-3">
        <YeonView className="min-w-0">
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className={SHARED_FEATURE_CLASS.text12Soft}
          >
            집중 작업 중
          </YeonText>
          <YeonText
            as="h2"
            variant="unstyled"
            tone="inherit"
            className="mt-1 break-words text-[17px] font-black text-[#111]"
          >
            {selectedDeck?.title ?? "선택한 덱"}
          </YeonText>
        </YeonView>
        <Timer aria-hidden="true" size={20} />
      </YeonView>

      <YeonText
        as="strong"
        variant="unstyled"
        tone="inherit"
        className="mt-5 block text-[42px] font-black leading-none text-[#111]"
      >
        {formatRemainingSeconds(remainingSeconds)}
      </YeonText>
      <YeonView
        aria-hidden="true"
        className="mt-5 h-2 overflow-hidden rounded-full bg-[#eee]"
      >
        <YeonView
          className="h-full rounded-full bg-[#111]"
          style={{ width: `${progressPercent}%` }}
        />
      </YeonView>
      <YeonView className="mt-3 grid grid-cols-3 gap-2">
        {[
          ["큐", `${completedCount}/${queueLength}`],
          ["모드", modeLabel],
          ["채점", `${stats.reviewed}장`],
        ].map(([label, value]) => (
          <YeonView
            key={label}
            className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-3"
          >
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className={SHARED_FEATURE_CLASS.text12Soft}
            >
              {label}
            </YeonText>
            <YeonText
              as="strong"
              variant="unstyled"
              tone="inherit"
              className="mt-1 block truncate text-[13px] font-black text-[#111]"
            >
              {value}
            </YeonText>
          </YeonView>
        ))}
      </YeonView>
      <YeonButton
        type="button"
        variant="secondary"
        onClick={onFinish}
        className="mt-4 w-full px-4 py-3 text-[13px]"
      >
        세션 종료하고 요약 보기
      </YeonButton>
    </YeonSurface>
  );
}

function QueueCompletePanel({
  onFinish,
  remainingSeconds,
}: {
  onFinish: () => void;
  remainingSeconds: number;
}) {
  return (
    <YeonSurface className="w-full max-w-[760px] border-[#111] p-6 text-center">
      <CheckCircle2
        aria-hidden="true"
        size={34}
        className="mx-auto text-[#111]"
      />
      <YeonText
        as="h2"
        variant="unstyled"
        tone="inherit"
        className="mt-4 text-[22px] font-black text-[#111]"
      >
        카드 큐를 모두 봤습니다.
      </YeonText>
      <YeonText
        as="p"
        variant="unstyled"
        tone="inherit"
        className={`mx-auto mt-3 max-w-[520px] ${SHARED_FEATURE_CLASS.text13Neutral} leading-[1.8]`}
      >
        남은 {formatRemainingSeconds(remainingSeconds)} 동안 정리하거나 다시
        떠올려보세요. 타이머가 끝나면 자동으로 요약됩니다.
      </YeonText>
      <YeonView className="mx-auto mt-5 grid max-w-[620px] gap-2 text-left sm:grid-cols-3">
        {[
          ["1", "답을 보지 않고 핵심을 다시 말하기"],
          ["2", "헷갈린 포인트 하나만 고르기"],
          ["3", "Today에서 이어 할 행동만 남기기"],
        ].map(([step, label]) => (
          <YeonView
            key={step}
            className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-3"
          >
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#111] text-[11px] font-black text-white"
            >
              {step}
            </YeonText>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="mt-2 break-words text-[12px] font-bold leading-[1.6] text-[#111]"
            >
              {label}
            </YeonText>
          </YeonView>
        ))}
      </YeonView>
      <YeonButton
        type="button"
        variant="primary"
        onClick={onFinish}
        className="mt-5 px-4 py-3 text-[14px]"
      >
        지금 요약 보기
      </YeonButton>
    </YeonSurface>
  );
}

function SummaryCard({
  onRestart,
  summary,
  todoTaskId,
  todoTitle,
}: {
  onRestart: () => void;
  summary: FocusDeskSummary;
  todoTaskId: string | null;
  todoTitle: string | null;
}) {
  const todoReturnHref = resolveTodoServiceHref({ todoTaskId });

  return (
    <YeonSurface
      as="section"
      className={`w-full max-w-[760px] border-[#111] p-6 ${YEON_WEB_SHADOW_CLASS.cardSoft}`}
    >
      <YeonView className="flex items-center gap-2">
        <CheckCircle2 aria-hidden="true" size={20} />
        <YeonText
          as="h2"
          variant="unstyled"
          tone="inherit"
          className="text-[20px] font-black tracking-[-0.03em] text-[#111]"
        >
          집중 세션 요약
        </YeonText>
      </YeonView>

      <YeonView className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["계획", `${summary.plannedMinutes}분`],
          ["실제", formatElapsedSeconds(summary.elapsedSeconds)],
          ["채점", `${summary.reviewed}장`],
          ["스킵", `${summary.skipped}장`],
        ].map(([label, value]) => (
          <YeonView
            key={label}
            className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-4"
          >
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className={SHARED_FEATURE_CLASS.text12Soft}
            >
              {label}
            </YeonText>
            <YeonText
              as="strong"
              variant="unstyled"
              tone="inherit"
              className="mt-1 block text-[22px] font-black text-[#111]"
            >
              {value}
            </YeonText>
          </YeonView>
        ))}
      </YeonView>

      <YeonView className="mt-4 grid gap-2 rounded-lg border border-[#e5e5e5] bg-white p-4 sm:grid-cols-3">
        <YeonText variant="unstyled" tone="inherit" className="text-[13px]">
          어려움 {summary.hard}
        </YeonText>
        <YeonText variant="unstyled" tone="inherit" className="text-[13px]">
          보통 {summary.good}
        </YeonText>
        <YeonText variant="unstyled" tone="inherit" className="text-[13px]">
          쉬움 {summary.easy}
        </YeonText>
      </YeonView>

      {todoTitle ? (
        <YeonView className="mt-5 rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-4">
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className={`break-words ${SHARED_FEATURE_CLASS.text13Emphasis}`}
          >
            연결된 할 일: {todoTitle}
          </YeonText>
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className={`mt-1 ${SHARED_FEATURE_CLASS.text12Soft}`}
          >
            완료 처리는 Today에서 직접 확인합니다.
          </YeonText>
        </YeonView>
      ) : null}

      <YeonView className="mt-6 flex flex-wrap gap-3">
        <YeonButton
          type="button"
          variant="primary"
          onClick={onRestart}
          className="gap-2 px-4 py-3 text-[14px]"
        >
          <RotateCcw aria-hidden="true" size={16} />
          같은 덱으로 다시 시작
        </YeonButton>
        <YeonLink
          href={todoReturnHref}
          className="inline-flex items-center gap-2 rounded-lg border border-[#e5e5e5] bg-white px-4 py-3 text-[14px] font-bold text-[#111] no-underline hover:border-[#111]"
        >
          <ListTodo aria-hidden="true" size={16} />
          Today로 돌아가기
        </YeonLink>
      </YeonView>
    </YeonSurface>
  );
}

export function FocusDeskScreen() {
  const router = useYeonRouter();
  const pathname = useYeonPathname();
  const searchParams = useYeonSearchParams();
  const selectedDeckId = normalizeQueryText(searchParams.get("deckId"));
  const todoTaskId = normalizeQueryText(searchParams.get("todoTaskId"));
  const todoTitle = normalizeQueryText(searchParams.get("todoTitle"));
  const mode = parseFocusDeskMode(searchParams.get("mode"));
  const minutes = parseFocusDeskSessionMinutes(searchParams.get("minutes"));

  const decksQuery = useDeckList();
  const detailQuery = useDeckDetail(selectedDeckId ?? "");
  const reviewMutation = useReviewCardWithDeckDetailCache(selectedDeckId ?? "");
  const [sessionStatus, setSessionStatus] =
    useState<FocusDeskSessionStatus>("setup");
  const [sessionStartedAt, setSessionStartedAt] = useState<Date | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(minutes * 60);
  const [sessionQueue, setSessionQueue] = useState<CardDeckItemDto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnswerVisible, setAnswerVisible] = useState(false);
  const [stats, setStats] = useState<FocusDeskReviewStats>(() =>
    createInitialFocusDeskStats()
  );
  const [summary, setSummary] = useState<FocusDeskSummary | null>(null);

  const decks = decksQuery.data ?? [];
  const selectedDeck = useMemo(
    () => decks.find((deck) => deck.id === selectedDeckId) ?? null,
    [decks, selectedDeckId]
  );
  const plannedQueue = useMemo(
    () =>
      buildFocusDeskStudyQueue({
        items: detailQuery.data?.items ?? [],
        minutes,
        mode,
      }),
    [detailQuery.data?.items, minutes, mode]
  );
  const visibleQueue =
    sessionStatus === "running" ? sessionQueue : plannedQueue;
  const currentItem = sessionQueue[currentIndex] ?? null;
  const hasDecks = Boolean(decks[0]);
  const hasPlannedCards = Boolean(plannedQueue[0]);
  const hasSessionCards = Boolean(sessionQueue[0]);
  const isFinished = sessionStatus === "finished";
  const canStart =
    Boolean(selectedDeckId) &&
    detailQuery.isSuccess &&
    hasPlannedCards &&
    sessionStatus !== "running";

  const writeQuery = useCallback(
    (updates: Record<string, string | null>) => {
      const nextParams = createYeonUrlSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null) {
          nextParams.delete(key);
        } else {
          nextParams.set(key, value);
        }
      }
      const query = nextParams.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams]
  );

  const resetSessionState = useCallback(() => {
    setSessionStatus("setup");
    setSessionStartedAt(null);
    setRemainingSeconds(minutes * 60);
    setSessionQueue([]);
    setCurrentIndex(0);
    setAnswerVisible(false);
    setStats(createInitialFocusDeskStats());
    setSummary(null);
  }, [minutes]);

  useEffect(() => {
    resetSessionState();
  }, [mode, resetSessionState, selectedDeckId]);

  useEffect(() => {
    if (sessionStatus !== "running") return;

    const timerId = window.setInterval(() => {
      setRemainingSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [sessionStatus]);

  const finishSessionWithStats = useCallback(
    (nextStats: FocusDeskReviewStats) => {
      const startedAt = sessionStartedAt ?? new Date();
      setSummary(
        createFocusDeskSummary({
          endedAt: new Date(),
          plannedMinutes: minutes,
          startedAt,
          stats: nextStats,
        })
      );
      setSessionStatus("finished");
      setRemainingSeconds(0);
      setAnswerVisible(false);
    },
    [minutes, sessionStartedAt]
  );

  useEffect(() => {
    if (sessionStatus === "running" && remainingSeconds === 0) {
      finishSessionWithStats(stats);
    }
  }, [finishSessionWithStats, remainingSeconds, sessionStatus, stats]);

  const moveToNextCardOrWaitForTimer = useCallback(() => {
    setAnswerVisible(false);
    setCurrentIndex(
      getNextFocusDeskCardIndex({
        currentIndex,
        queueLength: sessionQueue.length,
      })
    );
  }, [currentIndex, sessionQueue.length]);

  function handleDeckSelect(deckId: string) {
    writeQuery({ deckId });
  }

  function handleMinutesSelect(nextMinutes: FocusDeskSessionMinutes) {
    writeQuery({ minutes: String(nextMinutes) });
  }

  function handleModeSelect(nextMode: FocusDeskMode) {
    writeQuery({ mode: nextMode });
  }

  function handleStartSession() {
    if (!canStart) return;
    setSessionStatus("running");
    setSessionStartedAt(new Date());
    setRemainingSeconds(minutes * 60);
    setSessionQueue(plannedQueue);
    setCurrentIndex(0);
    setAnswerVisible(false);
    setStats(createInitialFocusDeskStats());
    setSummary(null);
  }

  function handleRevealAnswer() {
    setAnswerVisible(true);
  }

  function handleSkip() {
    if (sessionStatus !== "running") return;
    const nextStats = applyFocusDeskSkip(stats);
    setStats(nextStats);
    moveToNextCardOrWaitForTimer();
  }

  function handleReview(difficulty: CardReviewDifficulty) {
    if (!currentItem || sessionStatus !== "running" || !isAnswerVisible) {
      return;
    }

    reviewMutation.mutate(
      { difficulty, itemId: currentItem.id },
      {
        onSuccess: () => {
          const nextStats = applyFocusDeskReviewResult(stats, difficulty);
          setStats(nextStats);
          moveToNextCardOrWaitForTimer();
        },
      }
    );
  }

  return (
    <YeonView className="min-h-screen bg-[#fafafa] text-[#111]">
      <CommonProductHeader activeService="card" />

      <YeonView
        as="main"
        className="mx-auto grid w-full min-w-0 max-w-[1280px] grid-cols-[minmax(0,1fr)] gap-8 px-6 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-10 md:px-12 md:pb-12"
      >
        <YeonView className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <YeonView className="min-w-0">
            <YeonView className="flex min-w-0 max-w-full flex-wrap items-center gap-3">
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                className="inline-flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-3 py-1 text-[12px] font-bold text-[#111]"
              >
                <Timer aria-hidden="true" size={14} />
                MoodDesk
              </YeonText>
              {todoTitle ? (
                <YeonText
                  as="span"
                  variant="unstyled"
                  tone="inherit"
                  className="flex w-full max-w-full min-w-0 items-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-3 py-1 text-[12px] font-bold text-[#666] sm:w-auto sm:max-w-[28rem]"
                >
                  <ListTodo aria-hidden="true" size={14} className="shrink-0" />
                  <span className="block min-w-0 flex-1 truncate">
                    {todoTitle}
                  </span>
                </YeonText>
              ) : null}
            </YeonView>
            <YeonText
              as="h1"
              variant="unstyled"
              tone="inherit"
              className="mt-4 break-words text-[32px] font-black leading-tight tracking-[-0.04em] text-[#111] md:text-[44px]"
            >
              카드 덱을 집중 세션으로 실행합니다.
            </YeonText>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className={`mt-4 max-w-[760px] ${SHARED_FEATURE_CLASS.text13Neutral} leading-[1.8] md:text-[15px]`}
            >
              덱과 시간을 직접 고르면 MoodDesk가 카드 순서, 타이머, 채점 흐름을
              한 화면에 묶습니다. 덱 원본과 복습 기록은 card-service가 그대로
              관리합니다.
            </YeonText>
          </YeonView>

          <YeonSurface
            className={`border-[#e5e5e5] p-5 ${YEON_WEB_SHADOW_CLASS.cardSoft}`}
          >
            <YeonView className="flex items-center justify-between gap-3">
              <YeonView>
                <YeonText
                  as="p"
                  variant="unstyled"
                  tone="inherit"
                  className={SHARED_FEATURE_CLASS.text12Soft}
                >
                  {isFinished ? "세션 상태" : "현재 세션"}
                </YeonText>
                <YeonText
                  as="strong"
                  variant="unstyled"
                  tone="inherit"
                  className="mt-1 block text-[34px] font-black text-[#111]"
                  data-testid="focus-desk-timer"
                >
                  {isFinished
                    ? "완료"
                    : formatRemainingSeconds(remainingSeconds)}
                </YeonText>
              </YeonView>
              {isFinished ? (
                <CheckCircle2
                  aria-hidden="true"
                  size={42}
                  className="text-[#111]"
                />
              ) : (
                <Clock3 aria-hidden="true" size={42} className="text-[#111]" />
              )}
            </YeonView>
            {isFinished && summary ? (
              <YeonView className="mt-4 rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-4 py-3">
                <YeonText
                  as="p"
                  variant="unstyled"
                  tone="inherit"
                  className={SHARED_FEATURE_CLASS.text13Emphasis}
                >
                  {summary.reviewed}장 채점 · 실제{" "}
                  {formatElapsedSeconds(summary.elapsedSeconds)}
                </YeonText>
              </YeonView>
            ) : (
              <YeonView className="mt-4 grid grid-cols-3 gap-2">
                {FOCUS_DESK_SESSION_MINUTES.map((option) => (
                  <SegmentButton
                    key={option}
                    selected={minutes === option}
                    disabled={sessionStatus === "running"}
                    onClick={() => handleMinutesSelect(option)}
                  >
                    {option}분
                  </SegmentButton>
                ))}
              </YeonView>
            )}
            {sessionStatus === "running" ? (
              <YeonView className="mt-4 rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-4 py-3 text-center">
                <YeonText
                  as="p"
                  variant="unstyled"
                  tone="inherit"
                  className={SHARED_FEATURE_CLASS.text13Emphasis}
                >
                  타이머 실행 중
                </YeonText>
              </YeonView>
            ) : isFinished ? null : (
              <YeonButton
                type="button"
                variant="primary"
                disabled={!canStart}
                onClick={handleStartSession}
                className="mt-4 w-full gap-2 px-4 py-4 text-[14px]"
                data-testid="focus-desk-start"
              >
                <Timer aria-hidden="true" size={16} />
                집중 시작
              </YeonButton>
            )}
            {sessionStatus === "running" ? (
              <YeonButton
                type="button"
                variant="secondary"
                onClick={() => finishSessionWithStats(stats)}
                className="mt-2 w-full px-4 py-3 text-[13px]"
              >
                세션 종료하고 요약 보기
              </YeonButton>
            ) : null}
          </YeonSurface>
        </YeonView>

        <YeonView className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <YeonView className="grid min-w-0 content-start gap-20 pb-12 lg:gap-4 lg:pb-0">
            {sessionStatus === "running" ? (
              <RunningSessionPanel
                mode={mode}
                queueLength={sessionQueue.length}
                remainingSeconds={remainingSeconds}
                selectedDeck={selectedDeck}
                stats={stats}
                onFinish={() => finishSessionWithStats(stats)}
              />
            ) : (
              <>
                <YeonSurface className="border-[#e5e5e5] p-5">
                  <YeonView className="flex items-center justify-between gap-3">
                    <YeonText
                      as="h2"
                      variant="unstyled"
                      tone="inherit"
                      className="text-[16px] font-black text-[#111]"
                    >
                      학습할 덱
                    </YeonText>
                    <BookOpen aria-hidden="true" size={18} />
                  </YeonView>

                  {decksQuery.isPending ? (
                    <YeonText
                      as="p"
                      variant="unstyled"
                      tone="inherit"
                      className={`mt-4 ${SHARED_FEATURE_CLASS.text13Soft}`}
                    >
                      덱을 불러오는 중...
                    </YeonText>
                  ) : null}

                  {decksQuery.isError ? (
                    <YeonText
                      as="p"
                      variant="unstyled"
                      tone="inherit"
                      className={`mt-4 ${CARD_SERVICE_COMMON_CLASS.errorTextSm}`}
                    >
                      덱 목록을 불러오지 못했습니다.
                    </YeonText>
                  ) : null}

                  {!decksQuery.isPending && !hasDecks ? (
                    <YeonView className="mt-4 rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-4">
                      <YeonText
                        as="p"
                        variant="unstyled"
                        tone="inherit"
                        className={SHARED_FEATURE_CLASS.text13Emphasis}
                      >
                        아직 학습할 덱이 없습니다.
                      </YeonText>
                      <YeonLink
                        href={resolveYeonWebPath("cardDeckList")}
                        className="mt-3 inline-flex rounded-lg bg-[#111] px-4 py-2 text-[13px] font-bold text-white no-underline"
                      >
                        덱 만들러 가기
                      </YeonLink>
                    </YeonView>
                  ) : null}

                  <YeonView className="mt-4 grid gap-3">
                    {decks.map((deck) => (
                      <DeckOptionCard
                        key={deck.id}
                        deck={deck}
                        disabled={false}
                        selected={deck.id === selectedDeckId}
                        onSelect={handleDeckSelect}
                      />
                    ))}
                  </YeonView>
                </YeonSurface>

                <YeonSurface className="border-[#e5e5e5] p-5">
                  <YeonText
                    as="h2"
                    variant="unstyled"
                    tone="inherit"
                    className="text-[16px] font-black text-[#111]"
                  >
                    세션 모드
                  </YeonText>
                  <YeonView className="mt-4 grid gap-2">
                    {FOCUS_DESK_MODE_OPTIONS.map((option) => (
                      <button
                        key={option.mode}
                        type="button"
                        aria-pressed={mode === option.mode}
                        disabled={false}
                        onClick={() => handleModeSelect(option.mode)}
                        className={`rounded-lg border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                          mode === option.mode
                            ? "border-[#111] bg-[#111] text-white"
                            : "border-[#e5e5e5] bg-white text-[#111] hover:border-[#111]"
                        }`}
                      >
                        <YeonText
                          as="span"
                          variant="unstyled"
                          tone="inherit"
                          className="block text-[14px] font-bold"
                        >
                          {option.label}
                        </YeonText>
                        <YeonText
                          as="span"
                          variant="unstyled"
                          tone="inherit"
                          className={`mt-1 block text-[12px] ${
                            mode === option.mode
                              ? "text-white/75"
                              : "text-[#666]"
                          }`}
                        >
                          {option.description}
                        </YeonText>
                      </button>
                    ))}
                  </YeonView>
                </YeonSurface>
              </>
            )}
          </YeonView>

          <YeonView className="flex min-w-0 flex-col items-center gap-5">
            {selectedDeck ? (
              <YeonView className="w-full max-w-[760px] rounded-lg border border-[#e5e5e5] bg-white p-4">
                <YeonText
                  as="p"
                  variant="unstyled"
                  tone="inherit"
                  className={SHARED_FEATURE_CLASS.text12Soft}
                >
                  선택된 덱
                </YeonText>
                <YeonText
                  as="h2"
                  variant="unstyled"
                  tone="inherit"
                  className="mt-1 break-words text-[18px] font-black text-[#111]"
                >
                  {selectedDeck.title}
                </YeonText>
                <YeonText
                  as="p"
                  variant="unstyled"
                  tone="inherit"
                  className={`mt-1 ${SHARED_FEATURE_CLASS.text13Neutral}`}
                >
                  이번 세션 큐 {visibleQueue.length}장 / 전체{" "}
                  {selectedDeck.itemCount}장
                </YeonText>
              </YeonView>
            ) : null}

            {selectedDeckId && detailQuery.isPending ? (
              <YeonText
                as="p"
                variant="unstyled"
                tone="inherit"
                className={SHARED_FEATURE_CLASS.text14Soft}
              >
                덱 상세를 불러오는 중...
              </YeonText>
            ) : null}

            {selectedDeckId && detailQuery.isError ? (
              <YeonText
                as="p"
                variant="unstyled"
                tone="inherit"
                className={CARD_SERVICE_COMMON_CLASS.errorTextMd}
              >
                덱 상세를 불러오지 못했습니다.
              </YeonText>
            ) : null}

            {selectedDeckId && detailQuery.isSuccess && !hasPlannedCards ? (
              <YeonSurface className="w-full max-w-[760px] border-[#e5e5e5] p-6 text-center">
                <YeonText
                  as="p"
                  variant="unstyled"
                  tone="inherit"
                  className={SHARED_FEATURE_CLASS.text16Emphasis}
                >
                  이 덱에는 진행할 카드가 없습니다.
                </YeonText>
                <YeonLink
                  href={resolveYeonWebPath("cardDeckDetail", {
                    deckId: selectedDeckId,
                  })}
                  className="mt-4 inline-flex rounded-lg bg-[#111] px-4 py-3 text-[14px] font-bold text-white no-underline"
                >
                  덱에서 카드 추가하기
                </YeonLink>
              </YeonSurface>
            ) : null}

            {!selectedDeckId ? (
              <YeonSurface className="w-full max-w-[760px] border-[#e5e5e5] p-8 text-center">
                <BookOpen
                  aria-hidden="true"
                  size={34}
                  className="mx-auto text-[#111]"
                />
                <YeonText
                  as="p"
                  variant="unstyled"
                  tone="inherit"
                  className="mt-4 text-[18px] font-black text-[#111]"
                >
                  먼저 학습할 덱을 선택하세요.
                </YeonText>
                <YeonText
                  as="p"
                  variant="unstyled"
                  tone="inherit"
                  className={`mt-2 ${SHARED_FEATURE_CLASS.text13Neutral}`}
                >
                  {todoTitle
                    ? "Todo에서 온 작업도 먼저 학습할 덱을 직접 골라야 시작됩니다."
                    : "MoodDesk는 사용자가 고른 덱 안에서만 세션을 구성합니다."}
                </YeonText>
              </YeonSurface>
            ) : null}

            {sessionStatus === "running" && currentItem ? (
              <DeckPlayReviewModeCard
                currentIndex={currentIndex}
                isAnswerVisible={isAnswerVisible}
                isSaving={reviewMutation.isPending}
                item={currentItem}
                onRevealAnswer={handleRevealAnswer}
                onReview={handleReview}
                onSkip={handleSkip}
                totalCount={sessionQueue.length}
              />
            ) : null}

            {sessionStatus === "running" && !currentItem && hasSessionCards ? (
              <QueueCompletePanel
                remainingSeconds={remainingSeconds}
                onFinish={() => finishSessionWithStats(stats)}
              />
            ) : null}

            {sessionStatus === "finished" && summary ? (
              <SummaryCard
                summary={summary}
                todoTaskId={todoTaskId}
                todoTitle={todoTitle}
                onRestart={handleStartSession}
              />
            ) : null}

            {reviewMutation.error ? (
              <YeonText
                as="p"
                variant="unstyled"
                tone="inherit"
                className={CARD_SERVICE_COMMON_CLASS.errorTextSm}
              >
                {reviewMutation.error.message}
              </YeonText>
            ) : null}
          </YeonView>
        </YeonView>
      </YeonView>
    </YeonView>
  );
}
