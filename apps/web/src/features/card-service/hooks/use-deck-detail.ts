"use client";
import { useYeonQuery as useQuery } from "@yeon/ui/runtime/YeonQuery";
import { useYeonCardItemRepository } from "@yeon/ui/runtime/ports/card-deck";
import { useIsAuthenticated } from "../auth-context";
import { cardServiceQueryKeys } from "../card-service-query-keys";

export function useDeckDetail(deckId: string) {
  const isAuthenticated = useIsAuthenticated();
  const repository = useYeonCardItemRepository();
  return useQuery({
    queryKey: cardServiceQueryKeys.deckDetail(isAuthenticated, deckId),
    queryFn: () => repository.getDeckDetail(deckId),
    enabled: deckId.length > 0,
  });
}
