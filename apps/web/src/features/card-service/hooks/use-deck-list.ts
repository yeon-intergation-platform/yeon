"use client";

import { useQuery } from "@tanstack/react-query";
import type { CardDeckDto } from "@yeon/api-contract/card-decks";

import { listGuestDecks } from "@/lib/guest-card-service-store";

import { useIsAuthenticated } from "../auth-context";
import { listServerCardDecksOrNull } from "../card-service-fetch";
import { cardServiceQueryKeys } from "../card-service-query-keys";

async function fetchCardDecks(): Promise<CardDeckDto[]> {
  const serverDecks = await listServerCardDecksOrNull();
  return serverDecks ?? listGuestDecks();
}

export function useDeckList() {
  const isAuthenticated = useIsAuthenticated();
  return useQuery({
    queryKey: cardServiceQueryKeys.decks(isAuthenticated),
    queryFn: isAuthenticated ? fetchCardDecks : listGuestDecks,
  });
}
