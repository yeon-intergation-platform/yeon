"use client";
import {
  useYeonMutation as useMutation,
  useYeonQueryClient as useQueryClient,
} from "@yeon/ui/runtime/YeonQuery";
import {
  useYeonCardDeckRepository,
  type YeonCardDeckRepository,
} from "@yeon/ui/runtime/ports/card-deck";
import type { UpdateCardDeckBody } from "@yeon/api-contract/card-decks";
import { useCardServiceAuth } from "../auth-context";
import { CardServiceApiError } from "../card-service-fetch";
import { cardServiceQueryKeys } from "../card-service-query-keys";

function invalidateDeckQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  isAuthenticated: boolean,
  deckId?: string
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

// 데이터 변형은 repository 포트가, 401 인증 오류 처리는 세션(auth-context)이 담당한다(관심사 분리).
async function withAuthErrorHandling<T>(
  run: () => Promise<T>,
  queryClient: ReturnType<typeof useQueryClient>,
  markUnauthenticated: () => void,
  deckId?: string
): Promise<T> {
  try {
    return await run();
  } catch (error) {
    if (error instanceof CardServiceApiError && error.status === 401) {
      markUnauthenticated();
      invalidateDeckQueries(queryClient, true, deckId);
      invalidateDeckQueries(queryClient, false, deckId);
    }
    throw error;
  }
}

export function useUpdateDeck(deckId: string) {
  const queryClient = useQueryClient();
  const { isAuthenticated, markUnauthenticated } = useCardServiceAuth();
  const repository: YeonCardDeckRepository = useYeonCardDeckRepository();
  return useMutation({
    mutationFn: (body: UpdateCardDeckBody) =>
      withAuthErrorHandling(
        () => repository.updateDeck(deckId, body),
        queryClient,
        markUnauthenticated,
        deckId
      ),
    onSuccess: () => {
      invalidateDeckQueries(queryClient, isAuthenticated, deckId);
    },
  });
}

export function useDeleteDeck() {
  const queryClient = useQueryClient();
  const { isAuthenticated, markUnauthenticated } = useCardServiceAuth();
  const repository: YeonCardDeckRepository = useYeonCardDeckRepository();
  return useMutation({
    mutationFn: (deckId: string) =>
      withAuthErrorHandling(
        () => repository.deleteDeck(deckId),
        queryClient,
        markUnauthenticated,
        deckId
      ),
    onSuccess: () => {
      invalidateDeckQueries(queryClient, isAuthenticated);
    },
  });
}
