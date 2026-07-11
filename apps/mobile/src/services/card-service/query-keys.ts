// queryKey SSOT 재수출 (parity: identical-value).
// 정의는 단일 SSOT에만 둔다 — 여기서는 이름/인자 매핑만 한다.
// SSOT: packages/ui/src/runtime/ports/card-deck/query-keys.ts
//
// idx=158 fix: web adapter(deckDetail: cardDeckQueryKeys.detail)와 시그니처 통일.
// 양 앱 어댑터 모두 (isAuthenticated, deckId) 순서. 호출부도 함께 수정됨.
import {
  cardDeckQueryKeys,
  cardRecallQueryKeys,
} from "@yeon/ui/runtime/ports/card-deck";

export const cardServiceQueryKeys = {
  all: cardDeckQueryKeys.root,
  decks: cardDeckQueryKeys.list,
  deckDetail: cardDeckQueryKeys.detail,
  recallHistory: cardRecallQueryKeys.history,
};
