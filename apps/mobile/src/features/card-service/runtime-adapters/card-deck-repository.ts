// 모바일 카드 덱 Repository 어댑터 (YeonCardDeckRepository 포트 구현).
//
// 게스트/서버 분기를 어댑터 안으로 흡수한다(guest-auth-branching). 화면은 분기를 모른다.
// 세션 토큰은 SessionPort 대용으로 현재 화면 세션 상태에서 주입받는다.
import type {
  CreateCardDeckBody,
  UpdateCardDeckBody,
} from "@yeon/api-contract/card-decks";
import type { YeonCardDeckRepository } from "@yeon/ui/runtime/ports/card-deck";

import { cardServiceApi } from "../../../services/card-service/client";
import {
  createGuestDeck,
  deleteGuestDeck,
  listGuestDecks,
  updateGuestDeck,
} from "../../../services/card-service/storage";

type MobileCardSession = {
  isSignedIn: boolean;
  sessionToken: string | null;
};

export function createMobileCardDeckRepository(
  session: MobileCardSession
): YeonCardDeckRepository {
  const token =
    session.isSignedIn && session.sessionToken ? session.sessionToken : null;

  return {
    async listDecks() {
      if (!token) {
        return listGuestDecks();
      }
      const response = await cardServiceApi.listCardDecks(token);
      return response.decks;
    },
    async createDeck(input: CreateCardDeckBody) {
      if (!token) {
        return createGuestDeck(input);
      }
      const response = await cardServiceApi.createCardDeck(input, token);
      return response.deck;
    },
    async updateDeck(deckId: string, patch: UpdateCardDeckBody) {
      if (!token) {
        return updateGuestDeck(deckId, patch);
      }
      const response = await cardServiceApi.updateCardDeck(
        deckId,
        patch,
        token
      );
      return response.deck;
    },
    async deleteDeck(deckId: string) {
      if (!token) {
        await deleteGuestDeck(deckId);
        return;
      }
      await cardServiceApi.deleteCardDeck(deckId, token);
    },
  };
}
