"use client";
import {
  YeonBadge,
  YeonButton,
  YeonSurface,
  getYeonSurfaceClassName,
  joinClassNames,
  YeonList,
  YeonListItem,
  YeonText,
  YeonView,
} from "@yeon/ui";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
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
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className={TYPING_SERVICE_COMMON_CLASS.panelTextEmphasis}
        >
          표시할 덱이 없습니다.
        </YeonText>
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className={`mt-2 ${SHARED_FEATURE_CLASS.text13Neutral}`}
        >
          내 덱 탭에서 새 덱을 만들거나 공개 덱을 둘러보세요.
        </YeonText>
      </YeonSurface>
    );
  }

  return (
    <YeonList className="grid gap-3">
      {decks.map((deck) => (
        <YeonListItem key={deck.id}>
          <YeonButton
            type="button"
            onClick={() => onSelectDeck(deck.id)}
            variant="ghost"
            size="sm"
            className={joinClassNames(
              getYeonSurfaceClassName({
                variant: selectedDeckId === deck.id ? "panel" : "card",
                className:
                  "w-full p-4 text-left transition-colors hover:border-[#111]",
              }),
              selectedDeckId === deck.id && "border-[#111]"
            )}
          >
            <YeonView className={SHARED_FEATURE_CLASS.alignBetweenStartGap3}>
              <YeonView className="min-w-0">
                <YeonText
                  as="h3"
                  variant="unstyled"
                  tone="inherit"
                  className={`truncate ${TYPING_SERVICE_COMMON_CLASS.panelTextEmphasis15}`}
                >
                  {deck.title}
                </YeonText>
                <YeonText
                  as="p"
                  variant="unstyled"
                  tone="inherit"
                  className={`${SHARED_FEATURE_CLASS.text13Neutral} mt-1 line-clamp-2 break-keep leading-5`}
                >
                  {deck.description || "설명이 없습니다."}
                </YeonText>
              </YeonView>
              <YeonBadge className="shrink-0">
                {typingDeckBadge(deck)}
              </YeonBadge>
            </YeonView>
            <YeonView
              className={`mt-3 flex flex-wrap gap-2 ${SHARED_FEATURE_CLASS.text12Neutral}`}
            >
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                className={SHARED_FEATURE_CLASS.tagPill}
              >
                {typingDeckLanguageLabel(deck.languageTag)}
              </YeonText>
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                className={SHARED_FEATURE_CLASS.tagPill}
              >
                문단 {deck.passageCount ?? 0}개
              </YeonText>
            </YeonView>
          </YeonButton>
        </YeonListItem>
      ))}
    </YeonList>
  );
}
