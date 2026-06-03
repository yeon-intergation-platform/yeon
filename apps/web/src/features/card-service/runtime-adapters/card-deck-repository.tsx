"use client";
// 웹 카드 덱 Repository 어댑터 (YeonCardDeckRepository 포트 구현).
//
// 게스트/서버 분기를 어댑터 안으로 흡수한다(guest-auth-branching). 화면/훅은 분기를 모른다.
// 인증 상태는 SessionPort 대용으로 현재 auth-context의 isAuthenticated를 주입받아 사용한다.
import type { ReactNode } from "react";
import { useMemo } from "react";
import type {
  CardDeckDto,
  CreateCardDeckBody,
  UpdateCardDeckBody,
} from "@yeon/api-contract/card-decks";
import {
  YeonCardDeckRepositoryProvider,
  type YeonCardDeckRepository,
} from "@yeon/ui/runtime/ports/card-deck";

import { useIsAuthenticated } from "../auth-context";
import {
  cardServiceFetchJson,
  cardServiceFetchVoid,
  createServerCardDeck,
  listServerCardDecksOrNull,
} from "../card-service-fetch";
import {
  createGuestDeck,
  deleteGuestDeck,
  listGuestDecks,
  updateGuestDeck,
} from "@/lib/guest-card-service-store";

export function createWebCardDeckRepository(
  isAuthenticated: boolean
): YeonCardDeckRepository {
  return {
    async listDecks() {
      if (!isAuthenticated) {
        return listGuestDecks();
      }
      const serverDecks = await listServerCardDecksOrNull();
      return serverDecks ?? listGuestDecks();
    },
    createDeck(input: CreateCardDeckBody) {
      return isAuthenticated
        ? createServerCardDeck(input)
        : createGuestDeck(input);
    },
    async updateDeck(deckId: string, patch: UpdateCardDeckBody) {
      if (!isAuthenticated) {
        return updateGuestDeck(deckId, patch);
      }
      const data = await cardServiceFetchJson<{ deck: CardDeckDto }>(
        `/api/v1/card-decks/${deckId}`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(patch),
        },
        "덱을 수정하지 못했습니다."
      );
      return data.deck;
    },
    async deleteDeck(deckId: string) {
      if (!isAuthenticated) {
        await deleteGuestDeck(deckId);
        return;
      }
      await cardServiceFetchVoid(
        `/api/v1/card-decks/${deckId}`,
        { method: "DELETE" },
        "덱을 삭제하지 못했습니다."
      );
    },
  };
}

export function WebCardDeckRepositoryProvider({
  children,
}: {
  children: ReactNode;
}) {
  const isAuthenticated = useIsAuthenticated();
  const repository = useMemo(
    () => createWebCardDeckRepository(isAuthenticated),
    [isAuthenticated]
  );
  return (
    <YeonCardDeckRepositoryProvider value={repository}>
      {children}
    </YeonCardDeckRepositoryProvider>
  );
}
