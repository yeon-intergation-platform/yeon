"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CardDeckItemDto,
  CreateCardDeckItemBody,
  CreateCardDeckItemsBody,
  CardReviewDifficulty,
  CardStudyMode,
  UpdateCardDeckItemBody,
} from "@yeon/api-contract/card-decks";

import {
  addGuestCard,
  addGuestCards,
  deleteGuestCard,
  reviewGuestCard,
  setGuestCardStudyMode,
  updateGuestCard,
} from "@/lib/guest-card-service-store";

import { useCardServiceAuth } from "../auth-context";
import {
  CardServiceApiError,
  cardServiceFetchJson,
  cardServiceFetchVoid,
} from "../card-service-fetch";
import { cardServiceQueryKeys } from "../card-service-query-keys";

function invalidateDeckAndList(
  queryClient: ReturnType<typeof useQueryClient>,
  isAuthenticated: boolean,
  deckId: string
) {
  void queryClient.invalidateQueries({
    queryKey: cardServiceQueryKeys.deckDetail(isAuthenticated, deckId),
  });
  void queryClient.invalidateQueries({
    queryKey: cardServiceQueryKeys.decks(isAuthenticated),
  });
}

function useDeckMutation<TInput, TOutput>(
  deckId: string,
  mutationFn: (input: TInput, isAuthenticated: boolean) => Promise<TOutput>
) {
  const queryClient = useQueryClient();
  const { isAuthenticated, markUnauthenticated } = useCardServiceAuth();
  return useMutation({
    mutationFn: async (input: TInput) => {
      try {
        return await mutationFn(input, isAuthenticated);
      } catch (error) {
        if (error instanceof CardServiceApiError && error.status === 401) {
          markUnauthenticated();
          invalidateDeckAndList(queryClient, true, deckId);
          invalidateDeckAndList(queryClient, false, deckId);
        }
        throw error;
      }
    },
    onSuccess: () =>
      invalidateDeckAndList(queryClient, isAuthenticated, deckId),
  });
}

export function useAddCard(deckId: string) {
  return useDeckMutation(
    deckId,
    async (body: CreateCardDeckItemBody, isAuthenticated) => {
      if (isAuthenticated) {
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
      }
      return addGuestCard(deckId, body);
    }
  );
}

export function useAddCards(deckId: string) {
  return useDeckMutation(
    deckId,
    async (body: CreateCardDeckItemsBody, isAuthenticated) => {
      if (isAuthenticated) {
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
      }
      return addGuestCards(deckId, body);
    }
  );
}

export function useUpdateCard(deckId: string) {
  return useDeckMutation(
    deckId,
    async (
      params: { itemId: string; body: UpdateCardDeckItemBody },
      isAuthenticated
    ) => {
      if (isAuthenticated) {
        const data = await cardServiceFetchJson<{ item: CardDeckItemDto }>(
          `/api/v1/card-decks/${deckId}/items/${params.itemId}`,
          {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(params.body),
          },
          "카드를 수정하지 못했습니다."
        );
        return data.item;
      }
      return updateGuestCard(params.itemId, params.body);
    }
  );
}

export function useDeleteCard(deckId: string) {
  return useDeckMutation(deckId, async (itemId: string, isAuthenticated) => {
    if (isAuthenticated) {
      await cardServiceFetchVoid(
        `/api/v1/card-decks/${deckId}/items/${itemId}`,
        { method: "DELETE" },
        "카드를 삭제하지 못했습니다."
      );
      return;
    }
    await deleteGuestCard(itemId);
  });
}

export function useReviewCard(deckId: string) {
  return useDeckMutation(
    deckId,
    async (
      params: { itemId: string; difficulty: CardReviewDifficulty },
      isAuthenticated
    ) => {
      if (isAuthenticated) {
        const data = await cardServiceFetchJson<{ item: CardDeckItemDto }>(
          `/api/v1/card-decks/${deckId}/items/${params.itemId}/review`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ difficulty: params.difficulty }),
          },
          "복습 결과를 저장하지 못했습니다."
        );
        return data.item;
      }
      return reviewGuestCard(params.itemId, params.difficulty);
    }
  );
}

export function useUpdateCardStudyPreference(deckId: string) {
  const queryClient = useQueryClient();
  const { isAuthenticated, markUnauthenticated } = useCardServiceAuth();
  return useMutation({
    mutationFn: async (studyMode: CardStudyMode) => {
      if (!isAuthenticated) {
        setGuestCardStudyMode(studyMode);
        return { studyMode };
      }
      try {
        return await cardServiceFetchJson<{ studyMode: CardStudyMode }>(
          "/api/v1/card-decks/study-preference",
          {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ studyMode }),
          },
          "학습 모드를 저장하지 못했습니다.",
        );
      } catch (error) {
        if (error instanceof CardServiceApiError && error.status === 401) {
          markUnauthenticated();
          void queryClient.invalidateQueries({
            queryKey: cardServiceQueryKeys.deckDetail(true, deckId),
          });
        }
        throw error;
      }
    },
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: cardServiceQueryKeys.deckDetail(isAuthenticated, deckId),
      }),
  });
}
