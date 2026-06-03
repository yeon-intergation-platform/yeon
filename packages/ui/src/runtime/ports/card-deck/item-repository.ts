// 카드 아이템 Repository 포트 (parity: shared-contract).
//
// 덱 상세 로딩 + 카드 아이템 CRUD/복습/학습모드. 게스트/서버 분기는 어댑터가 흡수한다.
// 401 등 인증 오류는 throw하고, 캐시 무효화·markUnauthenticated는 호출부(훅/화면)가 담당한다.
// 레지스트리: docs/architecture/universal-ui-parity-registry.yaml (id: card-item-repository)
import type {
  CardDeckDetailResponse,
  CardDeckItemDto,
  CardReviewDifficulty,
  CardStudyMode,
  CreateCardDeckItemBody,
  CreateCardDeckItemsBody,
  UpdateCardDeckItemBody,
} from "@yeon/api-contract/card-decks";

import { createYeonRepositoryContext } from "../shared";

export interface YeonCardItemRepository {
  getDeckDetail(deckId: string): Promise<CardDeckDetailResponse>;
  addCard(
    deckId: string,
    body: CreateCardDeckItemBody
  ): Promise<CardDeckItemDto>;
  addCards(
    deckId: string,
    body: CreateCardDeckItemsBody
  ): Promise<CardDeckItemDto[]>;
  updateCard(
    deckId: string,
    itemId: string,
    body: UpdateCardDeckItemBody
  ): Promise<CardDeckItemDto>;
  deleteCard(deckId: string, itemId: string): Promise<void>;
  reviewCard(
    deckId: string,
    itemId: string,
    difficulty: CardReviewDifficulty
  ): Promise<CardDeckItemDto>;
  updateStudyPreference(
    studyMode: CardStudyMode
  ): Promise<{ studyMode: CardStudyMode }>;
}

const cardItemRepositoryContext =
  createYeonRepositoryContext<YeonCardItemRepository>("CardItem");

export const YeonCardItemRepositoryProvider =
  cardItemRepositoryContext.Provider;
export const useYeonCardItemRepository =
  cardItemRepositoryContext.useRepository;
