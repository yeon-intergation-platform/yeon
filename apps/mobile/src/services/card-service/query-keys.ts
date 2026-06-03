// queryKey SSOT 재수출 (parity: identical-value).
// 정의는 단일 SSOT에만 둔다 — 여기서는 기존 호출부 호환을 위한 이름/인자 매핑만 한다.
// SSOT: packages/ui/src/runtime/ports/card-deck/query-keys.ts
//
// PARITY NOTE (idx=158): web(card-service-query-keys.ts)는 deckDetail: cardDeckQueryKeys.detail
// → (isAuthenticated, deckId) 순서. 모바일 기존 호출부는 deck(deckId, isSignedIn) 순서로
// 인자가 역전되어 있었다. 호출부(play-screen, test)가 버킷 밖이므로 여기서는
// 기존 (deckId, isSignedIn) 시그니처를 유지하되 내부에서 SSOT 순서로 전달한다.
// 전체 통일은 play-screen/test 파일 담당 버킷에서 수행 예정.
import { cardDeckQueryKeys } from "@yeon/ui/runtime/ports/card-deck";

export const cardServiceQueryKeys = {
  all: cardDeckQueryKeys.root,
  decks: cardDeckQueryKeys.list,
  // TODO(idx=158): 인자 순서를 (isAuthenticated, deckId)로 통일 예정. 현재는 호환성 유지.
  deck: (deckId: string, isSignedIn: boolean) =>
    cardDeckQueryKeys.detail(isSignedIn, deckId),
};
