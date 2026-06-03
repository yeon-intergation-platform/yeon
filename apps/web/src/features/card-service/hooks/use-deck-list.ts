"use client";
import { useYeonQuery as useQuery } from "@yeon/ui/runtime/YeonQuery";
import { useYeonCardDeckRepository } from "@yeon/ui/runtime/ports/card-deck";
import { useIsAuthenticated } from "../auth-context";
import { cardServiceQueryKeys } from "../card-service-query-keys";

// 게스트/서버 분기는 repository 어댑터가 흡수한다. 여기서는 포트 동사만 호출한다.
export function useDeckList() {
  const isAuthenticated = useIsAuthenticated();
  const repository = useYeonCardDeckRepository();
  return useQuery({
    queryKey: cardServiceQueryKeys.decks(isAuthenticated),
    queryFn: () => repository.listDecks(),
  });
}
