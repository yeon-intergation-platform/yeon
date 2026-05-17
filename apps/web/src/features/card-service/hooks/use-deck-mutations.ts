"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CardDeckDto,
  UpdateCardDeckBody,
} from "@yeon/api-contract/card-decks";

import {
  deleteGuestDeck,
  updateGuestDeck,
} from "@/lib/guest-card-service-store";

import { useCardServiceAuth } from "../auth-context";
import {
  CardServiceApiError,
  cardServiceFetchJson,
  cardServiceFetchVoid,
} from "../card-service-fetch";
import { cardServiceQueryKeys } from "../card-service-query-keys";

function invalidateDeckQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  isAuthenticated: boolean,
  deckId?: string,
) {
  void queryClient.invalidateQueries({
    queryKey: cardServiceQueryKeys.decks(isAuthenticated),
  });
  if (deckId) {
    void queryClient.invalidateQueries({
      queryKey: cardServiceQueryKeys.deckDetail(isAuthenticated, deckId),
    });
  }
}

function handleAuthError(
  error: unknown,
  queryClient: ReturnType<typeof useQueryClient>,
  markUnauthenticated: () => void,
  deckId?: string,
) {
  if (error instanceof CardServiceApiError && error.status === 401) {
    markUnauthenticated();
    invalidateDeckQueries(queryClient, true, deckId);
    invalidateDeckQueries(queryClient, false, deckId);
  }
}

export function useUpdateDeck(deckId: string) {
  const queryClient = useQueryClient();
  const { isAuthenticated, markUnauthenticated } = useCardServiceAuth();
  return useMutation({
    mutationFn: async (body: UpdateCardDeckBody) => {
      try {
        if (isAuthenticated) {
          const data = await cardServiceFetchJson<{ deck: CardDeckDto }>(
            `/api/v1/card-decks/${deckId}`,
            {
              method: "PATCH",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(body),
            },
            "덱을 수정하지 못했습니다."
          );
          return data.deck;
        }
        return updateGuestDeck(deckId, body);
      } catch (error) {
        handleAuthError(error, queryClient, markUnauthenticated, deckId);
        throw error;
      }
    },
    onSuccess: () => {
      invalidateDeckQueries(queryClient, isAuthenticated, deckId);
    },
  });
}

export function useDeleteDeck() {
  const queryClient = useQueryClient();
  const { isAuthenticated, markUnauthenticated } = useCardServiceAuth();
  return useMutation({
    mutationFn: async (deckId: string) => {
      try {
        if (isAuthenticated) {
          await cardServiceFetchVoid(
            `/api/v1/card-decks/${deckId}`,
            { method: "DELETE" },
            "덱을 삭제하지 못했습니다."
          );
          return;
        }
        await deleteGuestDeck(deckId);
      } catch (error) {
        handleAuthError(error, queryClient, markUnauthenticated, deckId);
        throw error;
      }
    },
    onSuccess: () => {
      invalidateDeckQueries(queryClient, isAuthenticated);
    },
  });
}
