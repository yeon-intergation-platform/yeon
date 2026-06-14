"use client";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { CARD_SERVICE_COMMON_CLASS } from "./card-service-common.const";
import { useCallback, useEffect, useState } from "react";
import type { YeonUseQueryResult as UseQueryResult } from "@yeon/ui/runtime/YeonQuery";
import { resolveYeonWebPath } from "@yeon/ui/runtime/ports";
import { deriveCardDeckPlayViewState } from "@yeon/ui/runtime/ports/card-deck";
import {
  CARD_STUDY_MODES,
  CARD_REVIEW_DIFFICULTIES,
} from "@yeon/api-contract/card-decks";
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

type CardReviewShortcutUnsubscribe = () => void;

interface CardReviewShortcutBrowserPort {
  isBlockedTarget(target: EventTarget | null): boolean;
  subscribeKeydown(
    handler: (event: KeyboardEvent) => void
  ): CardReviewShortcutUnsubscribe;
}

const CARD_REVIEW_SHORTCUT_BLOCKED_TAGS = [
  "A",
  "BUTTON",
  "INPUT",
  "SELECT",
  "TEXTAREA",
] as const;

// 정답이 보일 때 숫자 키로 난이도를 채점한다. 버튼 순서(어려움·보통·쉬움)와 동일하게 매핑한다.
const CARD_REVIEW_DIFFICULTY_SHORTCUT: Record<string, CardReviewDifficulty> = {
  "1": CARD_REVIEW_DIFFICULTIES.hard,
  "2": CARD_REVIEW_DIFFICULTIES.good,
  "3": CARD_REVIEW_DIFFICULTIES.easy,
};

const CARD_REVIEW_SHORTCUT_BROWSER_PORT: CardReviewShortcutBrowserPort = {
  isBlockedTarget(target) {
    const HtmlElementConstructor = globalThis.HTMLElement;

    if (
      !HtmlElementConstructor ||
      !(target instanceof HtmlElementConstructor)
    ) {
      return false;
    }

    return (
      target.isContentEditable ||
      CARD_REVIEW_SHORTCUT_BLOCKED_TAGS.includes(
        target.tagName as (typeof CARD_REVIEW_SHORTCUT_BLOCKED_TAGS)[number]
      )
    );
  },
  subscribeKeydown(handler) {
    const browserWindow = globalThis.window;

    if (!browserWindow) {
      return () => {};
    }

    browserWindow.addEventListener("keydown", handler);
    return () => browserWindow.removeEventListener("keydown", handler);
  },
};

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
  const [revealedItemId, setRevealedItemId] = useState<string | null>(null);
  const currentItemId = play.currentItem?.id ?? null;
  // 정답 표시 여부를 현재 카드 id에서 파생한다. 카드가 바뀌면 같은 렌더에서 즉시 false가 되어
  // web이 인덱스를 URL(비동기)에서 읽어도 정답 숨김과 카드 전환 사이 프레임 갭(flicker)이 없다.
  const isReviewAnswerVisible =
    revealedItemId !== null && revealedItemId === currentItemId;

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

  const moveToNextReviewCard = useCallback(() => {
    // 정답 숨김은 카드 id 파생(isReviewAnswerVisible)이 처리하므로 인덱스만 이동한다.
    if (play.currentIndex >= play.items.length - 1) {
      play.handleFirst();
      return;
    }

    play.handleNext();
  }, [play]);

  const handleRevealReviewAnswer = useCallback(() => {
    if (!currentItemId) {
      return;
    }
    setRevealedItemId(currentItemId);
  }, [currentItemId]);

  const handleSkipReview = useCallback(() => {
    if (reviewMutation.isPending) {
      return;
    }

    moveToNextReviewCard();
  }, [moveToNextReviewCard, reviewMutation.isPending]);

  const handleReview = useCallback(
    (difficulty: CardReviewDifficulty) => {
      if (!play.currentItem || reviewMutation.isPending) {
        return;
      }
      reviewMutation.mutate(
        { difficulty, itemId: play.currentItem.id },
        { onSuccess: moveToNextReviewCard }
      );
    },
    [moveToNextReviewCard, play, reviewMutation]
  );

  useEffect(() => {
    if (studyMode !== CARD_STUDY_MODES.review || !currentItemId) {
      return;
    }

    function handleReviewShortcut(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        CARD_REVIEW_SHORTCUT_BROWSER_PORT.isBlockedTarget(event.target)
      ) {
        return;
      }

      if (event.key.toLowerCase() === "s") {
        event.preventDefault();
        handleSkipReview();
        return;
      }

      // 정답이 보일 때만 숫자 키로 채점한다(정답을 보기 전 채점 방지).
      if (isReviewAnswerVisible) {
        const difficulty = CARD_REVIEW_DIFFICULTY_SHORTCUT[event.key];
        if (difficulty) {
          event.preventDefault();
          handleReview(difficulty);
        }
        return;
      }

      if (event.code === "Space" || event.key === " ") {
        event.preventDefault();
        handleRevealReviewAnswer();
      }
    }

    return CARD_REVIEW_SHORTCUT_BROWSER_PORT.subscribeKeydown(
      handleReviewShortcut
    );
  }, [
    currentItemId,
    handleReview,
    handleRevealReviewAnswer,
    handleSkipReview,
    isReviewAnswerVisible,
    studyMode,
  ]);

  function handleStudyModeChange(nextMode: CardStudyMode) {
    setStudyMode(nextMode);
    setRevealedItemId(null);
    studyModeMutation.mutate(nextMode);
  }

  if (!play.currentItem) {
    return null;
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
              ? "정답보기 : 스페이스바 · 1,2,3 : 어려움,보통,쉬움 · s : 스킵"
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
          isAnswerVisible={isReviewAnswerVisible}
          isSaving={reviewMutation.isPending}
          item={play.currentItem}
          onRevealAnswer={handleRevealReviewAnswer}
          onReview={handleReview}
          onSkip={handleSkipReview}
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
