import {
  RECALL_API_PATHS,
  cardDeckAiPreviewResponseSchema,
  createCardDeckWithItemsResponseSchema,
  recallAttemptListResponseSchema,
  recallGradeResponseSchema,
} from "@yeon/api-contract/recall";
import type { YeonCardRecallRepository } from "@yeon/ui/runtime/ports/card-deck";
import { createGuestDeckWithItems } from "@/lib/guest-card-service-store";
import { cardServiceFetchJson } from "../card-service-fetch";

const LOGIN_REQUIRED_MESSAGE =
  "AI 생성과 서버 채점은 로그인 후 사용할 수 있습니다.";

export function createWebCardRecallRepository(
  isAuthenticated: boolean
): YeonCardRecallRepository {
  return {
    createAttempt(deckId, itemId, body) {
      if (!isAuthenticated) {
        return Promise.reject(new Error(LOGIN_REQUIRED_MESSAGE));
      }
      return cardServiceFetchJson(
        RECALL_API_PATHS.attempts(deckId, itemId),
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        },
        "백지 답안을 채점하지 못했습니다.",
        recallGradeResponseSchema
      );
    },
    listAttempts(deckId, limit = 20) {
      if (!isAuthenticated) {
        return Promise.reject(new Error(LOGIN_REQUIRED_MESSAGE));
      }
      return cardServiceFetchJson(
        RECALL_API_PATHS.attemptHistory(deckId, limit),
        {},
        "백지 기록을 불러오지 못했습니다.",
        recallAttemptListResponseSchema
      );
    },
    createAiPreview(body) {
      if (!isAuthenticated) {
        return Promise.reject(new Error(LOGIN_REQUIRED_MESSAGE));
      }
      return cardServiceFetchJson(
        RECALL_API_PATHS.aiDeckPreviews,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        },
        "AI 카드 초안을 만들지 못했습니다.",
        cardDeckAiPreviewResponseSchema
      );
    },
    createDeckWithItems(body) {
      if (!isAuthenticated) return createGuestDeckWithItems(body);
      return cardServiceFetchJson(
        RECALL_API_PATHS.createDeckWithItems,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        },
        "카드 덱을 저장하지 못했습니다.",
        createCardDeckWithItemsResponseSchema
      );
    },
  };
}
