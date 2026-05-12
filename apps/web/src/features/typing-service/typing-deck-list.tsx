"use client";

import {
  YeonBadge,
  YeonSurface,
  getYeonSurfaceClassName,
  joinClassNames,
} from "@/components/yeon-ui";
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
        <p className="text-[14px] font-semibold text-[#111]">
          표시할 덱이 없습니다.
        </p>
        <p className="mt-2 text-[13px] text-[#666]">
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
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-[15px] font-semibold text-[#111]">
                  {deck.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-[#666]">
                  {deck.description || "설명이 없습니다."}
                </p>
              </div>
              <YeonBadge className="shrink-0">
                {typingDeckBadge(deck)}
              </YeonBadge>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-[12px] text-[#666]">
              <span className="rounded-full border border-[#e5e5e5] px-2 py-0.5">
                {typingDeckLanguageLabel(deck.languageTag)}
              </span>
              <span className="rounded-full border border-[#e5e5e5] px-2 py-0.5">
                문단 {deck.passageCount ?? 0}개
              </span>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
