"use client";
import {
  useYeonMutation as useMutation,
  useYeonQueryClient as useQueryClient,
} from "@yeon/ui/runtime/YeonQuery";
import { useYeonCardDeckRepository } from "@yeon/ui/runtime/ports/card-deck";
import type { CreateCardDeckBody } from "@yeon/api-contract/card-decks";
import { useIsAuthenticated } from "../auth-context";
import { cardServiceQueryKeys } from "../card-service-query-keys";

export function useCreateDeck() {
  const queryClient = useQueryClient();
  const isAuthenticated = useIsAuthenticated();
  const repository = useYeonCardDeckRepository();
  return useMutation({
    mutationFn: (body: CreateCardDeckBody) => repository.createDeck(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: cardServiceQueryKeys.decks(isAuthenticated),
      });
    },
  });
}
