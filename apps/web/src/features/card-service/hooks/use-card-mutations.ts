"use client";
import {
  useYeonMutation as useMutation,
  useYeonQueryClient as useQueryClient,
} from "@yeon/ui/runtime/YeonQuery";
import {
  useYeonCardItemRepository,
  type YeonCardItemRepository,
} from "@yeon/ui/runtime/ports/card-deck";
import type {
  CardReviewDifficulty,
  CardStudyMode,
  CreateCardDeckItemBody,
  CreateCardDeckItemsBody,
  UpdateCardDeckItemBody,
} from "@yeon/api-contract/card-decks";
import { useCardServiceAuth } from "../auth-context";
import { CardServiceApiError } from "../card-service-fetch";
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

// 데이터 변형은 repository 포트가, 401 인증 오류 처리는 세션(auth-context)이 담당한다(관심사 분리).
function useDeckMutation<TInput, TOutput>(
  deckId: string,
  run: (repository: YeonCardItemRepository, input: TInput) => Promise<TOutput>
) {
  const queryClient = useQueryClient();
  const { isAuthenticated, markUnauthenticated } = useCardServiceAuth();
  const repository = useYeonCardItemRepository();
  return useMutation({
    mutationFn: async (input: TInput) => {
      try {
        return await run(repository, input);
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
  return useDeckMutation(deckId, (repository, body: CreateCardDeckItemBody) =>
    repository.addCard(deckId, body)
  );
}

export function useAddCards(deckId: string) {
  return useDeckMutation(deckId, (repository, body: CreateCardDeckItemsBody) =>
    repository.addCards(deckId, body)
  );
}

export function useReplaceCards(deckId: string) {
  return useDeckMutation(deckId, (repository, body: CreateCardDeckItemsBody) =>
    repository.replaceCards(deckId, body)
  );
}

export function useUpdateCard(deckId: string) {
  return useDeckMutation(
    deckId,
    (repository, params: { itemId: string; body: UpdateCardDeckItemBody }) =>
      repository.updateCard(deckId, params.itemId, params.body)
  );
}

export function useDeleteCard(deckId: string) {
  return useDeckMutation(deckId, (repository, itemId: string) =>
    repository.deleteCard(deckId, itemId)
  );
}

export function useReviewCard(deckId: string) {
  return useDeckMutation(
    deckId,
    (
      repository,
      params: { itemId: string; difficulty: CardReviewDifficulty }
    ) => repository.reviewCard(deckId, params.itemId, params.difficulty)
  );
}

export function useUpdateCardStudyPreference(deckId: string) {
  const queryClient = useQueryClient();
  const { isAuthenticated, markUnauthenticated } = useCardServiceAuth();
  const repository = useYeonCardItemRepository();
  return useMutation({
    mutationFn: async (studyMode: CardStudyMode) => {
      try {
        return await repository.updateStudyPreference(studyMode);
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
