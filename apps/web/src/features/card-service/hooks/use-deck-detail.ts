"use client";

import { useQuery } from "@tanstack/react-query";
import type { CardDeckDetailResponse } from "@yeon/api-contract/card-decks";

import { getGuestDeckDetail } from "@/lib/guest-card-service-store";

import { useIsAuthenticated } from "../auth-context";
import { loadServerCardDeckDetail } from "../card-service-fetch";
import { cardServiceQueryKeys } from "../card-service-query-keys";

async function fetchGuestDeckDetail(
  deckId: string
): Promise<CardDeckDetailResponse> {
  const result = await getGuestDeckDetail(deckId);
  if (!result) {
    throw new Error("덱을 찾을 수 없습니다.");
  }
  return result;
}

export function useDeckDetail(deckId: string) {
  const isAuthenticated = useIsAuthenticated();
  return useQuery({
    queryKey: cardServiceQueryKeys.deckDetail(isAuthenticated, deckId),
    queryFn: () =>
      isAuthenticated
        ? loadServerCardDeckDetail(deckId)
        : fetchGuestDeckDetail(deckId),
    enabled: deckId.length > 0,
  });
}
