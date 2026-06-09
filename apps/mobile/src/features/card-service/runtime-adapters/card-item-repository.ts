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
  replaceGuestCards,
  reviewGuestCard,
  setGuestCardStudyMode,
  updateGuestCard,
} from "../../../services/card-service/storage";
// MobileCardSession: card-deck-repository의 {isSignedIn, sessionToken}과 동일 타입으로 통일(idx=157).
// 기존 호출부 호환을 위해 {mode: CardServiceMode, sessionToken} union을 과도기적으로 허용한다.
// 신규 호출부는 반드시 isSignedIn 형태를 사용하고, 기존 호출부는 순차 마이그레이션 예정.
type MobileCardSession =
  | { isSignedIn: boolean; sessionToken: string | null }
  | { mode: "server" | "guest"; sessionToken: string | null };

function resolveToken(session: MobileCardSession): string | null {
  const isSignedIn =
    "isSignedIn" in session ? session.isSignedIn : session.mode === "server";
  return isSignedIn && session.sessionToken ? session.sessionToken : null;
}

export function createMobileCardItemRepository(
  session: MobileCardSession
): YeonCardItemRepository {
  const token = resolveToken(session);

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
    async replaceCards(deckId: string, body: CreateCardDeckItemsBody) {
      if (!token) {
        return replaceGuestCards(deckId, body);
      }
      const detail = await cardServiceApi.getCardDeckDetail(deckId, token);
      for (const item of detail.items) {
        await cardServiceApi.deleteCardDeckItem(deckId, item.id, token);
      }
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
