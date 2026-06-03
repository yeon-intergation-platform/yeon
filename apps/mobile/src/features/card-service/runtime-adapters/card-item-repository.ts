// 모바일 카드 아이템 Repository 어댑터 (YeonCardItemRepository 포트 구현).
//
// 게스트/서버 분기를 흡수한다. bulk 카드 생성은 모바일에 bulk 엔드포인트가 없어 기존처럼
// createCardDeckItem 루프로 처리한다(동작 보존). 세션은 화면 상태에서 주입받는다.
import type {
  CardDeckItemDto,
  CardReviewDifficulty,
  CardStudyMode,
  CreateCardDeckItemBody,
  CreateCardDeckItemsBody,
  UpdateCardDeckItemBody,
} from "@yeon/api-contract/card-decks";
import type { YeonCardItemRepository } from "@yeon/ui/runtime/ports/card-deck";

import { cardServiceApi } from "../../../services/card-service/client";
import {
  createGuestCard,
  createGuestCards,
  deleteGuestCard,
  getGuestDeckDetail,
  reviewGuestCard,
  setGuestCardStudyMode,
  updateGuestCard,
} from "../../../services/card-service/storage";
import {
  CARD_SERVICE_MODE,
  type CardServiceMode,
} from "./../card-service-session";

type MobileCardSession = {
  mode: CardServiceMode;
  sessionToken: string | null;
};

export function createMobileCardItemRepository(
  session: MobileCardSession
): YeonCardItemRepository {
  const token =
    session.mode === CARD_SERVICE_MODE.server && session.sessionToken
      ? session.sessionToken
      : null;

  return {
    async getDeckDetail(deckId: string) {
      if (token) {
        return cardServiceApi.getCardDeckDetail(deckId, token);
      }
      const guestDetail = await getGuestDeckDetail(deckId);
      if (!guestDetail) {
        throw new Error("덱을 찾을 수 없습니다.");
      }
      return guestDetail;
    },
    async addCard(deckId: string, body: CreateCardDeckItemBody) {
      if (!token) {
        return createGuestCard(deckId, body);
      }
      const response = await cardServiceApi.createCardDeckItem(
        deckId,
        body,
        token
      );
      return response.item;
    },
    async addCards(deckId: string, body: CreateCardDeckItemsBody) {
      if (!token) {
        return createGuestCards(deckId, body);
      }
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
    },
    async updateCard(
      deckId: string,
      itemId: string,
      body: UpdateCardDeckItemBody
    ) {
      if (!token) {
        return updateGuestCard(itemId, body);
      }
      const response = await cardServiceApi.updateCardDeckItem(
        deckId,
        itemId,
        body,
        token
      );
      return response.item;
    },
    async deleteCard(deckId: string, itemId: string) {
      if (!token) {
        await deleteGuestCard(itemId);
        return;
      }
      await cardServiceApi.deleteCardDeckItem(deckId, itemId, token);
    },
    async reviewCard(
      deckId: string,
      itemId: string,
      difficulty: CardReviewDifficulty
    ) {
      if (!token) {
        return reviewGuestCard(itemId, difficulty);
      }
      const response = await cardServiceApi.reviewCardDeckItem(
        deckId,
        itemId,
        { difficulty },
        token
      );
      return response.item;
    },
    async updateStudyPreference(studyMode: CardStudyMode) {
      if (!token) {
        await setGuestCardStudyMode(studyMode);
        return { studyMode };
      }
      return cardServiceApi.updateCardStudyPreference({ studyMode }, token);
    },
  };
}
