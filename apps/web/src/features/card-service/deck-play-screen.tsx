"use client";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { CARD_SERVICE_COMMON_CLASS } from "./card-service-common.const";
import { useCallback, useEffect, useState } from "react";
import type { YeonUseQueryResult as UseQueryResult } from "@yeon/ui/runtime/YeonQuery";
import { resolveYeonWebPath } from "@yeon/ui/runtime/ports";
import { deriveCardDeckPlayViewState } from "@yeon/ui/runtime/ports/card-deck";
import { CARD_STUDY_MODES } from "@yeon/api-contract/card-decks";
import type {
  CardReviewDifficulty,
  CardStudyMode,
  CardDeckDetailResponse,
  CardDeckDto,
  CardDeckItemDto,
} from "@yeon/api-contract/card-decks";
import { YeonButton, YeonLink, YeonView, YeonText } from "@yeon/ui";
import { PlayCard, PlayControls } from "./components";
import { DeckPlayReviewModeCard } from "./components/deck-play-review-mode-card";
import {
  useDeckDetail,
  useDeckPlayState,
  useReviewCard,
  useUpdateCardStudyPreference,
} from "./hooks";
import { PLATFORM_HOME_HREF } from "@/lib/platform-services";
import {
  DEFAULT_CARD_PLAY_CARD_SIZE,
  readStoredCardPlayCardSize,
  type CardPlayCardSize,
  writeStoredCardPlayCardSize,
} from "./utils/card-play-card-size";

// 분기 로직은 SSOT에서 파생한다(web/mobile 공용). 복제 금지.
function toViewState(query: UseQueryResult<CardDeckDetailResponse>) {
  return deriveCardDeckPlayViewState({
    isPending: query.isPending,
    isError: query.isError,
    data: query.data,
  });
}

interface DeckPlayScreenProps {
  deckId: string;
}

export function DeckPlayScreen({ deckId }: DeckPlayScreenProps) {
  const detailQuery = useDeckDetail(deckId);
  const state = toViewState(detailQuery);

  return (
    <YeonView className={SHARED_FEATURE_CLASS.pageSurface}>
      <YeonView
        as="header"
        className="border-b border-[#e5e5e5] px-6 py-3 md:px-12"
      >
        <YeonView className="mx-auto flex max-w-[1200px] items-center justify-between">
          <YeonLink
            href={resolveYeonWebPath("cardDeckDetail", { deckId })}
            className={`${SHARED_FEATURE_CLASS.text14Neutral} no-underline hover:text-[#111]`}
          >
            ← 덱으로
          </YeonLink>
          <YeonLink
            href={PLATFORM_HOME_HREF}
            className={`${CARD_SERVICE_COMMON_CLASS.panelTextEmphasis} no-underline hover:opacity-70`}
          >
            YEON 카드 · 실행
          </YeonLink>
        </YeonView>
      </YeonView>

      <YeonView
        as="main"
        className="mx-auto flex max-w-[1200px] flex-col items-center px-6 py-12 md:px-12"
      >
        {state.kind === "loading" ? (
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className={SHARED_FEATURE_CLASS.text14Soft}
          >
            불러오는 중...
          </YeonText>
        ) : null}

        {state.kind === "error" ? (
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className={CARD_SERVICE_COMMON_CLASS.errorTextMd}
          >
            {state.message}
          </YeonText>
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
      </YeonView>
    </YeonView>
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
    <YeonView className="flex flex-col items-center text-center">
      <YeonText
        as="h2"
        variant="unstyled"
        tone="inherit"
        className={CARD_SERVICE_COMMON_CLASS.panelBodyTitle}
      >
        {deck.title}
      </YeonText>
      <YeonText
        as="p"
        variant="unstyled"
        tone="inherit"
        className={`mt-3 ${CARD_SERVICE_COMMON_CLASS.mutedErrorTextMd}`}
      >
        아직 카드가 없습니다. 덱에 카드를 먼저 추가해주세요.
      </YeonText>
      <YeonLink
        href={resolveYeonWebPath("cardDeckDetail", { deckId })}
        className="mt-6 rounded-xl bg-[#111] px-5 py-3 text-[14px] font-semibold text-white no-underline hover:opacity-90"
      >
        덱으로 돌아가기
      </YeonLink>
    </YeonView>
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
  const [cardSize, setCardSize] = useState<CardPlayCardSize>(
    DEFAULT_CARD_PLAY_CARD_SIZE
  );

  useEffect(() => {
    setStudyMode(initialStudyMode);
  }, [initialStudyMode]);

  useEffect(() => {
    setCardSize(readStoredCardPlayCardSize(deckId));
  }, [deckId]);

  const handleCardSizeChange = useCallback(
    (nextSize: CardPlayCardSize) => {
      const normalizedSize = writeStoredCardPlayCardSize(deckId, nextSize);
      setCardSize(normalizedSize);
    },
    [deckId]
  );

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
    <YeonView className="flex w-full flex-col items-center gap-6">
      <YeonView className="flex w-full max-w-[760px] flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <YeonView>
          <YeonText
            as="h2"
            variant="unstyled"
            tone="inherit"
            className={SHARED_FEATURE_CLASS.text16Emphasis}
          >
            {deckTitle}
          </YeonText>
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className={`mt-1 ${SHARED_FEATURE_CLASS.text12Soft}`}
          >
            {studyMode === CARD_STUDY_MODES.review
              ? "문제와 정답을 함께 확인하고 난이도로 다음 복습일을 저장합니다."
              : "카드를 클릭하거나 Space·Enter를 눌러 뒤집을 수 있어요."}
          </YeonText>
        </YeonView>
        <YeonView className="flex gap-2">
          {STUDY_MODE_OPTIONS.map(({ mode, label }) => (
            <YeonButton
              key={mode}
              type="button"
              aria-pressed={studyMode === mode}
              onClick={() => handleStudyModeChange(mode)}
              variant={studyMode === mode ? "primary" : "secondary"}
              size="md"
              className="rounded-xl px-4 py-2 text-[13px]"
            >
              {label}
            </YeonButton>
          ))}
          <YeonButton
            type="button"
            onClick={play.handleToggleShuffle}
            variant="secondary"
            size="md"
            className={`rounded-xl px-4 py-2 ${SHARED_FEATURE_CLASS.text13Primary}`}
          >
            {play.isShuffled ? "섞기 해제" : "섞기"}
          </YeonButton>
        </YeonView>
      </YeonView>

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
            shouldAnimateFlip={play.shouldAnimateFlip}
            size={cardSize}
            onFlip={play.handleFlip}
            onSizeChange={handleCardSizeChange}
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
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className={CARD_SERVICE_COMMON_CLASS.errorTextSm}
        >
          {(reviewMutation.error ?? studyModeMutation.error)?.message}
        </YeonText>
      ) : null}
    </YeonView>
  );
}
