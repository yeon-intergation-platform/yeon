"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateCardDeckBody } from "@yeon/api-contract/card-decks";

import { createGuestDeck } from "@/lib/guest-card-service-store";

import { useIsAuthenticated } from "../auth-context";
import { createServerCardDeck } from "../card-service-fetch";
import { cardServiceQueryKeys } from "../card-service-query-keys";

export function useCreateDeck() {
  const queryClient = useQueryClient();
  const isAuthenticated = useIsAuthenticated();
  return useMutation({
    mutationFn: (body: CreateCardDeckBody) =>
      isAuthenticated ? createServerCardDeck(body) : createGuestDeck(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: cardServiceQueryKeys.decks(isAuthenticated),
      });
    },
  });
}
