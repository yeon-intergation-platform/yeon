import type { TypingDeckOption } from "./use-typing-settings";

export function normalizeDeckTitle(
  deck: TypingDeckOption,
  privateDeckLabel = "비공개 덱"
) {
  return deck.visibility === "private" ? privateDeckLabel : deck.title;
}
