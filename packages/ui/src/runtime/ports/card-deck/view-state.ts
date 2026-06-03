// 카드 덱 목록 view-state 파생 SSOT (parity: identical-value).
//
// 로딩/에러/빈/준비 상태 분기 로직을 web/mobile가 각각 복제하지 않도록 한곳에서 파생한다.
// (이전: web toViewState() ↔ mobile 화면 인라인 분기로 같은 로직이 두 벌 존재.)
// 프레임워크(TanStack) 타입을 받지 않도록 최소 스냅샷만 입력으로 받는다.
// 레지스트리: docs/architecture/universal-ui-parity-registry.yaml (id: screen-composition)
import type {
  CardDeckDetailResponse,
  CardDeckDto,
  CardDeckItemDto,
  CardStudyMode,
} from "@yeon/api-contract/card-decks";

export type YeonCardDeckListViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "empty" }
  | { kind: "ready"; decks: CardDeckDto[] };

export type YeonCardDeckListQuerySnapshot = {
  isPending: boolean;
  isError: boolean;
  data: CardDeckDto[] | undefined;
};

const DEFAULT_ERROR_MESSAGE = "덱 목록을 불러오지 못했습니다.";

export function deriveCardDeckListViewState(
  query: YeonCardDeckListQuerySnapshot,
  options?: { errorMessage?: string }
): YeonCardDeckListViewState {
  if (query.isPending) {
    return { kind: "loading" };
  }
  if (query.isError) {
    return {
      kind: "error",
      message: options?.errorMessage ?? DEFAULT_ERROR_MESSAGE,
    };
  }
  if (!query.data || query.data.length === 0) {
    return { kind: "empty" };
  }
  return { kind: "ready", decks: query.data };
}

/* ───────── 덱 상세 view-state (web/mobile 공용) ───────── */

export type YeonCardDeckDetailViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | {
      kind: "ready";
      deck: CardDeckDto;
      items: CardDeckItemDto[];
      isEmpty: boolean;
    };

export type YeonCardDeckDetailQuerySnapshot = {
  isPending: boolean;
  isError: boolean;
  data: CardDeckDetailResponse | undefined;
};

const DEFAULT_DETAIL_ERROR_MESSAGE = "덱을 불러오지 못했습니다.";

export function deriveCardDeckDetailViewState(
  query: YeonCardDeckDetailQuerySnapshot,
  options?: { errorMessage?: string }
): YeonCardDeckDetailViewState {
  if (query.isPending) {
    return { kind: "loading" };
  }
  if (query.isError || !query.data) {
    return {
      kind: "error",
      message: options?.errorMessage ?? DEFAULT_DETAIL_ERROR_MESSAGE,
    };
  }
  const items = query.data.items;
  return {
    kind: "ready",
    deck: query.data.deck,
    items,
    isEmpty: items.length === 0,
  };
}

/* ───────── 덱 플레이 view-state (web/mobile 공용) ───────── */

export type YeonCardDeckPlayViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "empty"; deck: CardDeckDto }
  | {
      kind: "ready";
      deck: CardDeckDto;
      items: CardDeckItemDto[];
      studyMode: CardStudyMode;
    };

export function deriveCardDeckPlayViewState(
  query: YeonCardDeckDetailQuerySnapshot,
  options?: { errorMessage?: string }
): YeonCardDeckPlayViewState {
  if (query.isPending) {
    return { kind: "loading" };
  }
  if (query.isError || !query.data) {
    return {
      kind: "error",
      message: options?.errorMessage ?? DEFAULT_DETAIL_ERROR_MESSAGE,
    };
  }
  const { deck, items, studyMode } = query.data;
  if (items.length === 0) {
    return { kind: "empty", deck };
  }
  return { kind: "ready", deck, items, studyMode };
}
