import type { TypingDeckOption } from "./use-typing-settings";

export function normalizeDeckTitle(deck: TypingDeckOption) {
  return deck.visibility === "private" ? "비공개 덱" : deck.title;
}
