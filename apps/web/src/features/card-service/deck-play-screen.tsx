"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import {
  CARD_REVIEW_DIFFICULTIES,
  CARD_STUDY_MODES,
  type CardReviewDifficulty,
  type CardStudyMode,
  type CardDeckDetailResponse,
  type CardDeckDto,
  type CardDeckItemDto,
} from "@yeon/api-contract/card-decks";

import { MarkdownContent, PlayCard, PlayControls } from "./components";
import {
  useDeckDetail,
  useDeckPlayState,
  useReviewCard,
  useUpdateCardStudyPreference,
} from "./hooks";

type DeckPlayViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "empty"; deck: CardDeckDto }
  | {
      kind: "ready";
      deck: CardDeckDto;
      items: CardDeckItemDto[];
      studyMode: CardStudyMode;
    };

function toViewState(
  query: UseQueryResult<CardDeckDetailResponse>,
): DeckPlayViewState {
  if (query.isPending) {
    return { kind: "loading" };
  }
  if (query.isError || !query.data) {
    return { kind: "error", message: "덱을 불러오지 못했습니다." };
  }
  const { deck, items, studyMode } = query.data;
  if (items.length === 0) {
    return { kind: "empty", deck };
  }
  return { kind: "ready", deck, items, studyMode };
}

interface DeckPlayScreenProps {
  deckId: string;
}

export function DeckPlayScreen({ deckId }: DeckPlayScreenProps) {
  const detailQuery = useDeckDetail(deckId);
  const state = toViewState(detailQuery);

  return (
    <div className="min-h-screen bg-white text-[#111]">
      <header className="border-b border-[#e5e5e5] px-6 py-3 md:px-12">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between">
          <Link
            href={`/card-service/decks/${deckId}`}
            className="text-[14px] text-[#666] no-underline hover:text-[#111]"
          >
            ← 덱으로
          </Link>
          <span className="text-[14px] font-semibold text-[#111]">
            YEON 카드 · 실행
          </span>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1200px] flex-col items-center px-6 py-12 md:px-12">
        {state.kind === "loading" ? (
          <p className="text-[14px] text-[#888]">불러오는 중...</p>
        ) : null}

        {state.kind === "error" ? (
          <p className="text-[14px] text-red-600">{state.message}</p>
        ) : null}

        {state.kind === "empty" ? (
          <EmptyPlayScreen deck={state.deck} deckId={deckId} />
        ) : null}

        {state.kind === "ready" ? (
          <ReadyPlayBody
            deckId={deckId}
            deckTitle={state.deck.title}
            initialStudyMode={state.studyMode}
            items={state.items}
          />
        ) : null}
      </main>
    </div>
  );
}

function EmptyPlayScreen({
  deck,
  deckId,
}: {
  deck: CardDeckDto;
  deckId: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="text-[18px] font-semibold text-[#111]">{deck.title}</h2>
      <p className="mt-3 text-[14px] text-[#666]">
        아직 카드가 없습니다. 덱에 카드를 먼저 추가해주세요.
      </p>
      <Link
        href={`/card-service/decks/${deckId}`}
        className="mt-6 rounded-xl bg-[#111] px-5 py-3 text-[14px] font-semibold text-white no-underline hover:bg-[#333]"
      >
        덱으로 돌아가기
      </Link>
    </div>
  );
}

function ReadyPlayBody({
  deckId,
  deckTitle,
  initialStudyMode,
  items,
}: {
  deckId: string;
  deckTitle: string;
  initialStudyMode: CardStudyMode;
  items: CardDeckItemDto[];
}) {
  const play = useDeckPlayState(items);
  const reviewMutation = useReviewCard(deckId);
  const studyModeMutation = useUpdateCardStudyPreference(deckId);
  const [studyMode, setStudyMode] = useState<CardStudyMode>(initialStudyMode);

  useEffect(() => {
    setStudyMode(initialStudyMode);
  }, [initialStudyMode]);

  if (!play.currentItem) {
    return null;
  }

  function handleStudyModeChange(nextMode: CardStudyMode) {
    setStudyMode(nextMode);
    studyModeMutation.mutate(nextMode);
  }

  function handleReview(difficulty: CardReviewDifficulty) {
    if (!play.currentItem) {
      return;
    }
    reviewMutation.mutate(
      { difficulty, itemId: play.currentItem.id },
      {
        onSuccess: () => {
          play.handleFirst();
        },
      },
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="flex w-full max-w-[760px] flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-[16px] font-semibold text-[#111]">{deckTitle}</h2>
          <p className="mt-1 text-[12px] text-[#888]">
            {studyMode === CARD_STUDY_MODES.review
              ? "문제와 정답을 함께 확인하고 난이도로 다음 복습일을 저장합니다."
              : "카드를 클릭하거나 Space·Enter를 눌러 뒤집을 수 있어요."}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            aria-pressed={studyMode === CARD_STUDY_MODES.flashcard}
            onClick={() => handleStudyModeChange(CARD_STUDY_MODES.flashcard)}
            className={`rounded-xl border px-4 py-2 text-[13px] font-semibold ${
              studyMode === CARD_STUDY_MODES.flashcard
                ? "border-[#111] bg-[#111] text-white"
                : "border-[#e5e5e5] text-[#111] hover:border-[#111]"
            }`}
          >
            플래시카드
          </button>
          <button
            type="button"
            aria-pressed={studyMode === CARD_STUDY_MODES.review}
            onClick={() => handleStudyModeChange(CARD_STUDY_MODES.review)}
            className={`rounded-xl border px-4 py-2 text-[13px] font-semibold ${
              studyMode === CARD_STUDY_MODES.review
                ? "border-[#111] bg-[#111] text-white"
                : "border-[#e5e5e5] text-[#111] hover:border-[#111]"
            }`}
          >
            복습 모드
          </button>
          <button
            type="button"
            onClick={play.handleToggleShuffle}
            className="rounded-xl border border-[#e5e5e5] px-4 py-2 text-[13px] text-[#111] hover:border-[#111]"
          >
            {play.isShuffled ? "섞기 해제" : "섞기"}
          </button>
        </div>
      </div>

      {studyMode === CARD_STUDY_MODES.review ? (
        <ReviewModeCard
          currentIndex={play.currentIndex}
          isSaving={reviewMutation.isPending}
          item={play.currentItem}
          onReview={handleReview}
          totalCount={play.items.length}
        />
      ) : (
        <>
          <PlayCard
            frontText={play.currentItem.frontText}
            backText={play.currentItem.backText}
            isFlipped={play.isFlipped}
            onFlip={play.handleFlip}
          />

          <PlayControls
            currentIndex={play.currentIndex}
            totalCount={play.items.length}
            onPrev={play.handlePrev}
            onNext={play.handleNext}
          />
        </>
      )}

      {reviewMutation.error || studyModeMutation.error ? (
        <p className="text-[13px] text-red-600">
          {(reviewMutation.error ?? studyModeMutation.error)?.message}
        </p>
      ) : null}
    </div>
  );
}

const REVIEW_ACTIONS: Array<{
  difficulty: CardReviewDifficulty;
  label: string;
  nextLabel: string;
  className: string;
}> = [
  {
    difficulty: CARD_REVIEW_DIFFICULTIES.hard,
    label: "어려움",
    nextLabel: "1일 후",
    className: "bg-[#ff6b45] text-white hover:bg-[#f05f3a]",
  },
  {
    difficulty: CARD_REVIEW_DIFFICULTIES.good,
    label: "좋음",
    nextLabel: "3일 후",
    className: "bg-[#1f8fe5] text-white hover:bg-[#1682d4]",
  },
  {
    difficulty: CARD_REVIEW_DIFFICULTIES.easy,
    label: "쉬움",
    nextLabel: "4일 후",
    className: "bg-[#49ad4f] text-white hover:bg-[#419d47]",
  },
];

function ReviewModeCard({
  currentIndex,
  isSaving,
  item,
  onReview,
  totalCount,
}: {
  currentIndex: number;
  isSaving: boolean;
  item: CardDeckItemDto;
  onReview: (difficulty: CardReviewDifficulty) => void;
  totalCount: number;
}) {
  return (
    <section className="w-full max-w-[760px] rounded-2xl border border-[#111] bg-white p-5 shadow-[0_18px_60px_rgba(0,0,0,0.08)] md:p-7">
      <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-4 text-[14px] font-semibold text-[#111]">
        <span>
          카드 | {currentIndex + 1}/{totalCount}
        </span>
        <span className="text-[#777]">자기평가형 복습</span>
      </div>

      <div className="mt-6 grid gap-5">
        <section>
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#888]">
            문제
          </p>
          <div className="mt-2 rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-4">
            <MarkdownContent>{item.frontText}</MarkdownContent>
          </div>
        </section>
        <section>
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#888]">
            정답
          </p>
          <div className="mt-2 rounded-xl border border-[#111] bg-[#111] p-4">
            <MarkdownContent inverted>{item.backText}</MarkdownContent>
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {REVIEW_ACTIONS.map((action) => (
          <button
            key={action.difficulty}
            type="button"
            onClick={() => onReview(action.difficulty)}
            disabled={isSaving}
            className={`rounded-xl px-4 py-4 text-[14px] font-semibold transition-colors disabled:opacity-50 ${action.className}`}
          >
            {isSaving ? "저장 중..." : `${action.label} · ${action.nextLabel}`}
          </button>
        ))}
      </div>
    </section>
  );
}
