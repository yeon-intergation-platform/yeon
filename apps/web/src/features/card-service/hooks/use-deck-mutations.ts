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
import {
  invalidateCardDeckQueries,
  withCardServiceAuthExpiredHandling,
} from "./card-service-mutation-policy";

export function useUpdateDeck(deckId: string) {
  const queryClient = useQueryClient();
  const { isAuthenticated, markUnauthenticated } = useCardServiceAuth();
  const repository: YeonCardDeckRepository = useYeonCardDeckRepository();
  return useMutation({
    mutationFn: (body: UpdateCardDeckBody) =>
      withCardServiceAuthExpiredHandling(
        () => repository.updateDeck(deckId, body),
        { queryClient, markUnauthenticated, deckId }
      ),
    onSuccess: () => {
      invalidateCardDeckQueries(queryClient, isAuthenticated, deckId);
    },
  });
}

export function useDeleteDeck() {
  const queryClient = useQueryClient();
  const { isAuthenticated, markUnauthenticated } = useCardServiceAuth();
  const repository: YeonCardDeckRepository = useYeonCardDeckRepository();
  return useMutation({
    mutationFn: (deckId: string) =>
      withCardServiceAuthExpiredHandling(() => repository.deleteDeck(deckId), {
        queryClient,
        markUnauthenticated,
        deckId,
      }),
    onSuccess: () => {
      invalidateCardDeckQueries(queryClient, isAuthenticated);
    },
  });
}
