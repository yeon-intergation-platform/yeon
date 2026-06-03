import type {
  YeonCardDeckDetailViewState,
  YeonCardDeckListViewState,
} from "@yeon/ui/runtime/ports/card-deck";

// view-state는 SSOT에서 파생한다(복제 금지). SSOT: packages/ui/.../card-deck/view-state.ts
export type CardServiceHomeViewState = YeonCardDeckListViewState;
export type DeckDetailViewState = YeonCardDeckDetailViewState;
