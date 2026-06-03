// 카드 덱 Repository 포트 (parity: shared-contract).
//
// 인터페이스는 SSOT, 구현(어댑터)은 플랫폼별:
//   web: 서버 fetch ↔ IndexedDB 게스트 / mobile: @yeon/api-client ↔ JSON 게스트
// 화면/훅은 이 인터페이스 동사만 호출하고 게스트/서버 분기·저장형식을 모른다(guest-auth-branching).
// 401 등 인증 오류는 CardServiceApiError류로 throw하고, markUnauthenticated 같은 세션 처리는
// 호출부(훅)가 SessionPort로 담당한다(관심사 분리).
// 레지스트리: docs/architecture/universal-ui-parity-registry.yaml (id: card-deck-repository)
import type {
  CardDeckDto,
  CreateCardDeckBody,
  UpdateCardDeckBody,
} from "@yeon/api-contract/card-decks";

import { createYeonRepositoryContext } from "../shared";

export interface YeonCardDeckRepository {
  listDecks(): Promise<CardDeckDto[]>;
  createDeck(input: CreateCardDeckBody): Promise<CardDeckDto>;
  updateDeck(deckId: string, patch: UpdateCardDeckBody): Promise<CardDeckDto>;
  deleteDeck(deckId: string): Promise<void>;
}

const cardDeckRepositoryContext =
  createYeonRepositoryContext<YeonCardDeckRepository>("CardDeck");

export const YeonCardDeckRepositoryProvider =
  cardDeckRepositoryContext.Provider;
export const useYeonCardDeckRepository =
  cardDeckRepositoryContext.useRepository;
