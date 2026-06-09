import type { YeonCardItemRepository } from "@yeon/ui/runtime/ports/card-deck";

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

export function createMobileGuestCardItemRepository(): YeonCardItemRepository {
  return {
    async getDeckDetail(deckId) {
      const guestDetail = await getGuestDeckDetail(deckId);
      if (!guestDetail) {
        throw new Error("덱을 찾을 수 없습니다.");
      }
      return guestDetail;
    },
    addCard(deckId, body) {
      return createGuestCard(deckId, body);
    },
    addCards(deckId, body) {
      return createGuestCards(deckId, body);
    },
    replaceCards(deckId, body) {
      return replaceGuestCards(deckId, body);
    },
    updateCard(_deckId, itemId, body) {
      return updateGuestCard(itemId, body);
    },
    async deleteCard(_deckId, itemId) {
      await deleteGuestCard(itemId);
    },
    reviewCard(_deckId, itemId, difficulty) {
      return reviewGuestCard(itemId, difficulty);
    },
    async updateStudyPreference(studyMode) {
      await setGuestCardStudyMode(studyMode);
      return { studyMode };
    },
  };
}
