"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import type {
  CardDeckItemDto,
  CardReviewDifficulty,
} from "@yeon/api-contract/card-decks";
import { createYeonUrlSearchParams } from "@yeon/ui/runtime/YeonBrowserRuntime";
import {
  useYeonPathname,
  useYeonRouter,
  useYeonSearchParams,
} from "@yeon/ui/runtime/YeonNavigation";
import { YeonView } from "@yeon/ui";
import { CommonProductHeader } from "@/components/product-shell/product-header";
import {
  useDeckDetail,
  useDeckList,
  useReviewCardWithDeckDetailCache,
} from "@/features/card-service/hooks";
import { normalizeQueryText } from "./focus-desk-format";
import { FocusDeskHero } from "./focus-desk-hero";
import { FocusDeskSidebar } from "./focus-desk-sidebar";
import { FocusDeskTimerPanel } from "./focus-desk-timer-panel";
import { FocusDeskWorkspace } from "./focus-desk-workspace";
import {
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
  type FocusDeskSessionStatus,
  type FocusDeskSummary,
} from "./focus-desk-session";

export function FocusDeskScreen(): ReactElement {
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
  const visibleQueueLength =
    sessionStatus === "running" ? sessionQueue.length : plannedQueue.length;
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

  const finishWithCurrentStats = () => finishSessionWithStats(stats);

  return (
    <YeonView className="min-h-screen bg-[#fafafa] text-[#111]">
      <CommonProductHeader activeService="card" />

      <YeonView
        as="main"
        className="mx-auto grid w-full min-w-0 max-w-[1280px] grid-cols-[minmax(0,1fr)] gap-8 px-6 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-10 md:px-12 md:pb-12"
      >
        <YeonView className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <FocusDeskHero todoTitle={todoTitle} />
          <FocusDeskTimerPanel
            canStart={canStart}
            isFinished={isFinished}
            minutes={minutes}
            remainingSeconds={remainingSeconds}
            sessionStatus={sessionStatus}
            summary={summary}
            onFinish={finishWithCurrentStats}
            onMinutesSelect={handleMinutesSelect}
            onStartSession={handleStartSession}
          />
        </YeonView>

        <YeonView className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <YeonView className="grid min-w-0 content-start gap-20 pb-12 lg:gap-4 lg:pb-0">
            <FocusDeskSidebar
              decks={decks}
              hasDecks={hasDecks}
              isDeckListError={decksQuery.isError}
              isDeckListPending={decksQuery.isPending}
              mode={mode}
              queueLength={sessionQueue.length}
              remainingSeconds={remainingSeconds}
              selectedDeck={selectedDeck}
              selectedDeckId={selectedDeckId}
              sessionStatus={sessionStatus}
              stats={stats}
              onDeckSelect={handleDeckSelect}
              onFinish={finishWithCurrentStats}
              onModeSelect={handleModeSelect}
            />
          </YeonView>

          <FocusDeskWorkspace
            currentIndex={currentIndex}
            currentItem={currentItem}
            hasPlannedCards={hasPlannedCards}
            hasSessionCards={hasSessionCards}
            isAnswerVisible={isAnswerVisible}
            isDetailError={detailQuery.isError}
            isDetailPending={detailQuery.isPending}
            isDetailSuccess={detailQuery.isSuccess}
            isSaving={reviewMutation.isPending}
            remainingSeconds={remainingSeconds}
            reviewErrorMessage={reviewMutation.error?.message ?? null}
            selectedDeck={selectedDeck}
            selectedDeckId={selectedDeckId}
            sessionQueueLength={sessionQueue.length}
            sessionStatus={sessionStatus}
            summary={summary}
            todoTaskId={todoTaskId}
            todoTitle={todoTitle}
            visibleQueueLength={visibleQueueLength}
            onFinish={finishWithCurrentStats}
            onRestart={handleStartSession}
            onRevealAnswer={handleRevealAnswer}
            onReview={handleReview}
            onSkip={handleSkip}
          />
        </YeonView>
      </YeonView>
    </YeonView>
  );
}
