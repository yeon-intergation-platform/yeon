import type {
  CardDeckItemDto,
  CreateCardDeckItemsBody,
} from "@yeon/api-contract/card-decks";
import type { YeonCardItemRepository } from "@yeon/ui/runtime/ports/card-deck";

import { cardServiceApi } from "../../../services/card-service/client";

async function createServerCardsIndividually(
  deckId: string,
  body: CreateCardDeckItemsBody,
  token: string
): Promise<CardDeckItemDto[]> {
  // 모바일은 bulk 엔드포인트가 없으므로 루프로 생성한다(기존 동작 보존).
  const created: CardDeckItemDto[] = [];
  for (const item of body.items) {
    const response = await cardServiceApi.createCardDeckItem(
      deckId,
      item,
      token
    );
    created.push(response.item);
  }
  return created;
}

async function deleteServerCards(
  deckId: string,
  itemIds: readonly string[],
  token: string
): Promise<void> {
  for (const itemId of itemIds) {
    await cardServiceApi.deleteCardDeckItem(deckId, itemId, token);
  }
}

export function createMobileServerCardItemRepository(
  token: string
): YeonCardItemRepository {
  return {
    getDeckDetail(deckId) {
      return cardServiceApi.getCardDeckDetail(deckId, token);
    },
    async addCard(deckId, body) {
      const response = await cardServiceApi.createCardDeckItem(
        deckId,
        body,
        token
      );
      return response.item;
    },
    addCards(deckId, body) {
      return createServerCardsIndividually(deckId, body, token);
    },
    async replaceCards(deckId, body) {
      const detail = await cardServiceApi.getCardDeckDetail(deckId, token);
      await deleteServerCards(
        deckId,
        detail.items.map((item) => item.id),
        token
      );
      return createServerCardsIndividually(deckId, body, token);
    },
    async updateCard(deckId, itemId, body) {
      const response = await cardServiceApi.updateCardDeckItem(
        deckId,
        itemId,
        body,
        token
      );
      return response.item;
    },
    deleteCard(deckId, itemId) {
      return cardServiceApi.deleteCardDeckItem(deckId, itemId, token);
    },
    async reviewCard(deckId, itemId, difficulty) {
      const response = await cardServiceApi.reviewCardDeckItem(
        deckId,
        itemId,
        { difficulty },
        token
      );
      return response.item;
    },
    updateStudyPreference(studyMode) {
      return cardServiceApi.updateCardStudyPreference({ studyMode }, token);
    },
  };
}
