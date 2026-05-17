"use client";

import {
  CARD_REVIEW_DIFFICULTIES,
  type CardDeckItemDto,
  type CardReviewDifficulty,
} from "@yeon/api-contract/card-decks";

import { MarkdownContent } from "./markdown-content";
import { CARD_SERVICE_COMMON_CLASS } from "../card-service-common.const";

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

interface DeckPlayReviewModeCardProps {
  currentIndex: number;
  isSaving: boolean;
  item: CardDeckItemDto;
  totalCount: number;
  onReview: (difficulty: CardReviewDifficulty) => void;
}

export function DeckPlayReviewModeCard({
  currentIndex,
  isSaving,
  item,
  onReview,
  totalCount,
}: DeckPlayReviewModeCardProps) {
  return (
    <section className="w-full max-w-[760px] rounded-2xl border border-[#111] bg-white p-5 shadow-[0_18px_60px_rgba(0,0,0,0.08)] md:p-7">
      <div
        className={`flex items-center justify-between border-b border-[#e5e5e5] pb-4 ${CARD_SERVICE_COMMON_CLASS.panelTextEmphasis}`}
      >
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
          <div className="mt-2 overflow-hidden rounded-xl border border-[#e5e5e5] bg-white">
            <div className="bg-[#111] px-3 py-1">
              <span className="text-[11px] font-semibold tracking-wide text-white">
                답변
              </span>
            </div>
            <div className="p-4">
              <MarkdownContent>{item.backText}</MarkdownContent>
            </div>
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
