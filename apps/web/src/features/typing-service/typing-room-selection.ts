import type { TypingRoomLanguage } from "@yeon/race-shared";

import type { TypingDeckOption } from "./use-typing-settings";

export function resolveTypingRoomSelectedDeck(
  selectedDeckId: string | undefined,
  decks: TypingDeckOption[],
  fallbackDeck: TypingDeckOption,
  language: TypingRoomLanguage,
): TypingDeckOption {
  const matchedDeck = decks.find((deck) => deck.id === selectedDeckId);
  if (matchedDeck) return matchedDeck;

  // Keep stale query IDs unresolved instead of rewriting them to a new default.
  // `resolveTypingRaceSeed` surfaces the race-seed 404, and the create-room
  // screen then offers the existing manual "기본 덱으로 시작" fallback.
  if (selectedDeckId) {
    return {
      id: selectedDeckId,
      title: "선택한 덱",
      languageTag: language,
      visibility: "public",
    };
  }

  return fallbackDeck;
}
