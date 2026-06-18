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
import { getTypingUiText } from "./typing-service-i18n";
import { useTypingSettings } from "./use-typing-settings";

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
  const { settings } = useTypingSettings();
  const deckText = getTypingUiText(settings.locale).deck;

  if (decks.length === 0) {
    return (
      <YeonSurface variant="empty" className="p-8">
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className={TYPING_SERVICE_COMMON_CLASS.panelTextEmphasis}
        >
          {deckText.emptyList}
        </YeonText>
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className={`mt-2 ${SHARED_FEATURE_CLASS.text13Neutral}`}
        >
          {deckText.emptyListHelp}
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
                  {deck.description || deckText.noDescription}
                </YeonText>
              </YeonView>
              <YeonBadge className="shrink-0">
                {typingDeckBadge(deck, deckText)}
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
                {typingDeckLanguageLabel(deck.languageTag, deckText)}
              </YeonText>
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                className={SHARED_FEATURE_CLASS.tagPill}
              >
                {deckText.passageCount(deck.passageCount ?? 0)}
              </YeonText>
            </YeonView>
          </YeonButton>
        </YeonListItem>
      ))}
    </YeonList>
  );
}
