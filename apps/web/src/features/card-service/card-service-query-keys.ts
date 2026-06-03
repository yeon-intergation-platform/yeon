// queryKey SSOT 재수출 (parity: identical-value).
// 정의는 단일 SSOT에만 둔다 — 여기서는 기존 호출부 호환을 위한 이름 매핑만 한다.
// SSOT: packages/ui/src/runtime/ports/card-deck/query-keys.ts
import { cardDeckQueryKeys } from "@yeon/ui/runtime/ports/card-deck";

export const cardServiceQueryKeys = {
  decks: cardDeckQueryKeys.list,
  deckDetail: cardDeckQueryKeys.detail,
};
