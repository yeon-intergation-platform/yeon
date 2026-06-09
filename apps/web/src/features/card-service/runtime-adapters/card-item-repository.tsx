"use client";
// 웹 카드 아이템 Repository 어댑터 (YeonCardItemRepository 포트 구현).
// 게스트(IDB)/서버(fetch) 분기를 흡수한다. 401은 throw하고 세션 처리는 호출부가 담당.
import type { ReactNode } from "react";
import { useMemo } from "react";
import type {
  CardDeckDetailResponse,
  CardDeckItemDto,
  CardReviewDifficulty,
  CardStudyMode,
  CreateCardDeckItemBody,
  CreateCardDeckItemsBody,
  UpdateCardDeckItemBody,
} from "@yeon/api-contract/card-decks";
import {
  YeonCardItemRepositoryProvider,
  type YeonCardItemRepository,
} from "@yeon/ui/runtime/ports/card-deck";

import { useIsAuthenticated } from "../auth-context";
import {
  cardServiceFetchJson,
  cardServiceFetchVoid,
  loadServerCardDeckDetail,
} from "../card-service-fetch";
import {
  addGuestCard,
  addGuestCards,
  deleteGuestCard,
  getGuestDeckDetail,
  replaceGuestCards,
  reviewGuestCard,
  setGuestCardStudyMode,
  updateGuestCard,
} from "@/lib/guest-card-service-store";

async function guestDeckDetailOrThrow(
  deckId: string
): Promise<CardDeckDetailResponse> {
  const result = await getGuestDeckDetail(deckId);
  if (!result) {
    throw new Error("덱을 찾을 수 없습니다.");
  }
  return result;
}

export function createWebCardItemRepository(
  isAuthenticated: boolean
): YeonCardItemRepository {
  return {
    getDeckDetail(deckId: string) {
      return isAuthenticated
        ? loadServerCardDeckDetail(deckId)
        : guestDeckDetailOrThrow(deckId);
    },
    async addCard(deckId: string, body: CreateCardDeckItemBody) {
      if (!isAuthenticated) {
        return addGuestCard(deckId, body);
      }
      const data = await cardServiceFetchJson<{ item: CardDeckItemDto }>(
        `/api/v1/card-decks/${deckId}/items`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        },
        "카드를 추가하지 못했습니다."
      );
      return data.item;
    },
    async addCards(deckId: string, body: CreateCardDeckItemsBody) {
      if (!isAuthenticated) {
        return addGuestCards(deckId, body);
      }
      const data = await cardServiceFetchJson<{ items: CardDeckItemDto[] }>(
        `/api/v1/card-decks/${deckId}/items/bulk`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        },
        "카드를 일괄 추가하지 못했습니다."
      );
      return data.items;
    },
    async replaceCards(deckId: string, body: CreateCardDeckItemsBody) {
      if (!isAuthenticated) {
        return replaceGuestCards(deckId, body);
      }
      const detail = await loadServerCardDeckDetail(deckId);
      for (const item of detail.items) {
        await cardServiceFetchVoid(
          `/api/v1/card-decks/${deckId}/items/${item.id}`,
          { method: "DELETE" },
          "기존 카드를 삭제하지 못했습니다."
        );
      }
      const data = await cardServiceFetchJson<{ items: CardDeckItemDto[] }>(
        `/api/v1/card-decks/${deckId}/items/bulk`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        },
        "카드를 덮어쓰지 못했습니다."
      );
      return data.items;
    },
    async updateCard(
      deckId: string,
      itemId: string,
      body: UpdateCardDeckItemBody
    ) {
      if (!isAuthenticated) {
        return updateGuestCard(itemId, body);
      }
      const data = await cardServiceFetchJson<{ item: CardDeckItemDto }>(
        `/api/v1/card-decks/${deckId}/items/${itemId}`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        },
        "카드를 수정하지 못했습니다."
      );
      return data.item;
    },
    async deleteCard(deckId: string, itemId: string) {
      if (!isAuthenticated) {
        await deleteGuestCard(itemId);
        return;
      }
      await cardServiceFetchVoid(
        `/api/v1/card-decks/${deckId}/items/${itemId}`,
        { method: "DELETE" },
        "카드를 삭제하지 못했습니다."
      );
    },
    async reviewCard(
      deckId: string,
      itemId: string,
      difficulty: CardReviewDifficulty
    ) {
      if (!isAuthenticated) {
        return reviewGuestCard(itemId, difficulty);
      }
      const data = await cardServiceFetchJson<{ item: CardDeckItemDto }>(
        `/api/v1/card-decks/${deckId}/items/${itemId}/review`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ difficulty }),
        },
        "복습 결과를 저장하지 못했습니다."
      );
      return data.item;
    },
    async updateStudyPreference(studyMode: CardStudyMode) {
      if (!isAuthenticated) {
        // setGuestCardStudyMode는 동기 함수(zustand store 직접 갱신).
        // 모바일 어댑터와 의미 통일: 저장 후 반환. 실패 시 예외 전파.
        setGuestCardStudyMode(studyMode);
        return { studyMode };
      }
      return cardServiceFetchJson<{ studyMode: CardStudyMode }>(
        "/api/v1/card-decks/study-preference",
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ studyMode }),
        },
        "학습 모드를 저장하지 못했습니다."
      );
    },
  };
}

export function WebCardItemRepositoryProvider({
  children,
}: {
  children: ReactNode;
}) {
  const isAuthenticated = useIsAuthenticated();
  const repository = useMemo(
    () => createWebCardItemRepository(isAuthenticated),
    [isAuthenticated]
  );
  return (
    <YeonCardItemRepositoryProvider value={repository}>
      {children}
    </YeonCardItemRepositoryProvider>
  );
}
