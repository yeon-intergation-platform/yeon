"use client";

import {
  YeonBadge,
  YeonSurface,
  getYeonSurfaceClassName,
  joinClassNames,
} from "@/components/yeon-ui";
import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";
import { TYPING_SERVICE_COMMON_CLASS } from "./typing-service-common.const";
import type { TypingDeckDto } from "./use-typing-decks";
import { typingDeckBadge, typingDeckLanguageLabel } from "./typing-deck-meta";

export type TypingDeckListProps = {
  decks: TypingDeckDto[];
  selectedDeckId: string | null;
  onSelectDeck: (deckId: string) => void;
};

export function TypingDeckList({
  decks,
  selectedDeckId,
  onSelectDeck,
}: TypingDeckListProps) {
  if (decks.length === 0) {
    return (
      <YeonSurface variant="empty" className="p-8">
        <p className={TYPING_SERVICE_COMMON_CLASS.panelTextEmphasis}>
          표시할 덱이 없습니다.
        </p>
        <p className={`mt-2 ${SHARED_FEATURE_CLASS.text13Neutral}`}>
          내 덱 탭에서 새 덱을 만들거나 공개 덱을 둘러보세요.
        </p>
      </YeonSurface>
    );
  }

  return (
    <ul className="grid gap-3">
      {decks.map((deck) => (
        <li key={deck.id}>
          <button
            type="button"
            onClick={() => onSelectDeck(deck.id)}
            className={joinClassNames(
              getYeonSurfaceClassName({
                variant: selectedDeckId === deck.id ? "panel" : "card",
                className:
                  "w-full p-4 text-left transition-colors hover:border-[#111]",
              }),
              selectedDeckId === deck.id && "border-[#111]"
            )}
          >
            <div className={SHARED_FEATURE_CLASS.alignBetweenStartGap3}>
              <div className="min-w-0">
                <h3
                  className={`truncate ${TYPING_SERVICE_COMMON_CLASS.panelTextEmphasis15}`}
                >
                  {deck.title}
                </h3>
                <p
                  className={`${SHARED_FEATURE_CLASS.text13Neutral} mt-1 line-clamp-2 break-keep leading-5`}
                >
                  {deck.description || "설명이 없습니다."}
                </p>
              </div>
              <YeonBadge className="shrink-0">
                {typingDeckBadge(deck)}
              </YeonBadge>
            </div>
            <div
              className={`mt-3 flex flex-wrap gap-2 ${SHARED_FEATURE_CLASS.text12Neutral}`}
            >
              <span className={SHARED_FEATURE_CLASS.tagPill}>
                {typingDeckLanguageLabel(deck.languageTag)}
              </span>
              <span className={SHARED_FEATURE_CLASS.tagPill}>
                문단 {deck.passageCount ?? 0}개
              </span>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
