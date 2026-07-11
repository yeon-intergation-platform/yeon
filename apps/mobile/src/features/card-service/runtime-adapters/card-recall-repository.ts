import type { YeonCardRecallRepository } from "@yeon/ui/runtime/ports/card-deck";
import { cardServiceApi } from "../../../services/card-service/client";

export function createMobileCardRecallRepository(
  sessionToken: string
): YeonCardRecallRepository {
  return {
    createAttempt(deckId, itemId, body) {
      return cardServiceApi.createRecallAttempt(
        deckId,
        itemId,
        body,
        sessionToken
      );
    },
    listAttempts(deckId, limit) {
      return cardServiceApi.listRecallAttempts(deckId, limit, sessionToken);
    },
    createAiPreview(body) {
      return cardServiceApi.createCardDeckAiPreview(body, sessionToken);
    },
    createDeckWithItems(body) {
      return cardServiceApi.createCardDeckWithItems(body, sessionToken);
    },
  };
}
