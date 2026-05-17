"use client";

import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";
import { CARD_SERVICE_COMMON_CLASS } from "./card-service-common.const";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import {
  CARD_STUDY_MODES,
  type CardReviewDifficulty,
  type CardStudyMode,
  type CardDeckDetailResponse,
  type CardDeckDto,
  type CardDeckItemDto,
} from "@yeon/api-contract/card-decks";

import { PlayCard, PlayControls } from "./components";
import { DeckPlayReviewModeCard } from "./components/deck-play-review-mode-card";
import {
  useDeckDetail,
  useDeckPlayState,
  useReviewCard,
  useUpdateCardStudyPreference,
} from "./hooks";
import { PLATFORM_HOME_HREF } from "@/lib/platform-services";

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
  query: UseQueryResult<CardDeckDetailResponse>
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
    <div className={SHARED_FEATURE_CLASS.pageSurface}>
      <header className="border-b border-[#e5e5e5] px-6 py-3 md:px-12">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between">
          <Link
            href={`/card-service/decks/${deckId}`}
            className={`${SHARED_FEATURE_CLASS.text14Neutral} no-underline hover:text-[#111]`}
          >
            ← 덱으로
          </Link>
          <Link
            href={PLATFORM_HOME_HREF}
            className={`${CARD_SERVICE_COMMON_CLASS.panelTextEmphasis} no-underline hover:opacity-70`}
          >
            YEON 카드 · 실행
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1200px] flex-col items-center px-6 py-12 md:px-12">
        {state.kind === "loading" ? (
          <p className={SHARED_FEATURE_CLASS.text14Soft}>불러오는 중...</p>
        ) : null}

        {state.kind === "error" ? (
          <p className={CARD_SERVICE_COMMON_CLASS.errorTextMd}>
            {state.message}
          </p>
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
      <h2 className={CARD_SERVICE_COMMON_CLASS.panelBodyTitle}>{deck.title}</h2>
      <p className={`mt-3 ${CARD_SERVICE_COMMON_CLASS.mutedErrorTextMd}`}>
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

const STUDY_MODE_OPTIONS = [
  { mode: CARD_STUDY_MODES.flashcard, label: "플래시카드" },
  { mode: CARD_STUDY_MODES.review, label: "복습 모드" },
] as const;

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
    if (!play.currentItem) return;
    reviewMutation.mutate(
      { difficulty, itemId: play.currentItem.id },
      { onSuccess: () => play.handleFirst() }
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="flex w-full max-w-[760px] flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className={SHARED_FEATURE_CLASS.text16Emphasis}>{deckTitle}</h2>
          <p className={`mt-1 ${SHARED_FEATURE_CLASS.text12Soft}`}>
            {studyMode === CARD_STUDY_MODES.review
              ? "문제와 정답을 함께 확인하고 난이도로 다음 복습일을 저장합니다."
              : "카드를 클릭하거나 Space·Enter를 눌러 뒤집을 수 있어요."}
          </p>
        </div>
        <div className="flex gap-2">
          {STUDY_MODE_OPTIONS.map(({ mode, label }) => (
            <button
              key={mode}
              type="button"
              aria-pressed={studyMode === mode}
              onClick={() => handleStudyModeChange(mode)}
              className={`rounded-xl border px-4 py-2 text-[13px] font-semibold ${
                studyMode === mode
                  ? "border-[#111] bg-[#111] text-white"
                  : "border-[#e5e5e5] text-[#111] hover:border-[#111]"
              }`}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={play.handleToggleShuffle}
            className={`rounded-xl border border-[#e5e5e5] px-4 py-2 ${SHARED_FEATURE_CLASS.text13Primary} hover:border-[#111]`}
          >
            {play.isShuffled ? "섞기 해제" : "섞기"}
          </button>
        </div>
      </div>

      {studyMode === CARD_STUDY_MODES.review ? (
        <DeckPlayReviewModeCard
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
        <p className={CARD_SERVICE_COMMON_CLASS.errorTextSm}>
          {(reviewMutation.error ?? studyModeMutation.error)?.message}
        </p>
      ) : null}
    </div>
  );
}
