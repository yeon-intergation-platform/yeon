"use client";
import {
  CARD_REVIEW_DIFFICULTIES,
  type CardDeckItemDto,
  type CardReviewDifficulty,
} from "@yeon/api-contract/card-decks";
import { MarkdownContent } from "./markdown-content";
import { CARD_SERVICE_COMMON_CLASS } from "../card-service-common.const";
import {
  YeonButton,
  YeonSurface,
  YeonView,
  YeonText,
  YEON_WEB_SHADOW_CLASS,
} from "@yeon/ui";

const REVIEW_ACTIONS: Array<{
  difficulty: CardReviewDifficulty;
  label: string;
  variant: "primary" | "secondary";
}> = [
  {
    difficulty: CARD_REVIEW_DIFFICULTIES.hard,
    label: "어려움",
    variant: "primary",
  },
  {
    difficulty: CARD_REVIEW_DIFFICULTIES.good,
    label: "좋음",
    variant: "secondary",
  },
  {
    difficulty: CARD_REVIEW_DIFFICULTIES.easy,
    label: "쉬움",
    variant: "secondary",
  },
];

type DeckPlayReviewModeCardProgressProps = {
  currentIndex: number;
  totalCount: number;
};

type DeckPlayReviewModeCardStateProps = {
  isAnswerVisible: boolean;
  isSaving: boolean;
  item: CardDeckItemDto;
};

type DeckPlayReviewModeCardActions = {
  onRevealAnswer: () => void;
  onReview: (difficulty: CardReviewDifficulty) => void;
  onSkip: () => void;
};

type DeckPlayReviewModeCardProps = DeckPlayReviewModeCardProgressProps &
  DeckPlayReviewModeCardStateProps &
  DeckPlayReviewModeCardActions;

export function DeckPlayReviewModeCard({
  currentIndex,
  isAnswerVisible,
  isSaving,
  item,
  onRevealAnswer,
  onReview,
  onSkip,
  totalCount,
}: DeckPlayReviewModeCardProps) {
  return (
    <YeonSurface
      as="section"
      className={`w-full max-w-[760px] border-[#111] p-5 md:p-7 ${YEON_WEB_SHADOW_CLASS.cardSoft}`}
    >
      <YeonView
        className={`flex items-center justify-between border-b border-[#e5e5e5] pb-4 ${CARD_SERVICE_COMMON_CLASS.panelTextEmphasis}`}
      >
        <YeonText as="span" variant="unstyled" tone="inherit">
          카드 {currentIndex + 1}/{totalCount}
        </YeonText>
        <YeonButton
          type="button"
          variant="secondary"
          onClick={onSkip}
          disabled={isSaving}
          aria-label="현재 복습 카드 스킵"
          className="rounded-xl px-3 py-2 text-[13px]"
        >
          스킵
        </YeonButton>
      </YeonView>

      <YeonView className="mt-6 grid gap-5">
        <YeonView as="section">
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#666]"
          >
            문제
          </YeonText>
          <YeonSurface variant="panel" className="mt-2 p-4">
            <MarkdownContent>{item.frontText}</MarkdownContent>
          </YeonSurface>
        </YeonView>
        {isAnswerVisible ? (
          <YeonView as="section">
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#666]"
            >
              정답
            </YeonText>
            <YeonSurface className="mt-2 overflow-hidden">
              <YeonView className="bg-[#111] px-3 py-1">
                <YeonText
                  as="span"
                  variant="unstyled"
                  tone="inherit"
                  className="text-[11px] font-semibold tracking-wide text-white"
                >
                  답변
                </YeonText>
              </YeonView>
              <YeonView className="p-4">
                <MarkdownContent>{item.backText}</MarkdownContent>
              </YeonView>
            </YeonSurface>
          </YeonView>
        ) : null}
      </YeonView>

      {isAnswerVisible ? (
        <YeonView className="mt-6 grid gap-3 md:grid-cols-3">
          {REVIEW_ACTIONS.map((action) => (
            <YeonButton
              key={action.difficulty}
              type="button"
              variant={action.variant}
              onClick={() => onReview(action.difficulty)}
              disabled={isSaving}
              className="px-4 py-4 text-[14px]"
            >
              {isSaving ? "저장 중..." : action.label}
            </YeonButton>
          ))}
        </YeonView>
      ) : (
        <YeonButton
          type="button"
          variant="primary"
          onClick={onRevealAnswer}
          className="mt-6 w-full px-4 py-4 text-[14px]"
        >
          정답보기
        </YeonButton>
      )}
    </YeonSurface>
  );
}
