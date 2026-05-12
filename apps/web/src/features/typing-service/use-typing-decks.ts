"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateTypingDeckBody,
  CreateTypingDeckPassageBody,
  CreateTypingDeckPassagesBody,
  TypingDeckDetailResponse,
  TypingDeckDto,
  TypingDeckLanguageTag,
  TypingDeckListScope as TypingDeckScope,
  TypingDeckPassageDto,
  TypingDeckVisibility,
  TypingPassageDifficulty,
  TypingPassageTextType,
  UpdateTypingDeckBody,
  UpdateTypingDeckPassageBody,
} from "@yeon/api-contract/typing-decks";

import {
  loadTypingDeckDetail,
  loadTypingDeckList,
  requestTypingDeck,
  requestTypingDeckPassage,
  typingServiceFetchJson,
  typingServiceFetchVoid,
} from "./typing-service-fetch";
import { typingServiceQueryKeys } from "./typing-service-query-keys";
export type {
  CreateTypingDeckBody,
  CreateTypingDeckPassageBody,
  CreateTypingDeckPassagesBody,
  TypingDeckDetailResponse,
  TypingDeckDto,
  TypingDeckLanguageTag,
  TypingDeckPassageDto,
  TypingDeckScope,
  TypingDeckVisibility,
  TypingPassageDifficulty,
  TypingPassageTextType,
  UpdateTypingDeckBody,
  UpdateTypingDeckPassageBody,
};

export const TYPING_DECK_LANGUAGE_OPTIONS: Array<{
  value: TypingDeckLanguageTag;
  label: string;
}> = [
  { value: "ko", label: "한국어" },
  { value: "en", label: "English" },
  { value: "mixed", label: "Mixed" },
  { value: "code", label: "Code" },
];

export const TYPING_DECK_VISIBILITY_OPTIONS: Array<{
  value: TypingDeckVisibility;
  label: string;
}> = [
  { value: "private", label: "비공개" },
  { value: "public", label: "공개" },
];

export const typingDecksRootQueryKey = typingServiceQueryKeys.deckLists;
export const typingDecksQueryKey = typingServiceQueryKeys.deckList;
export const typingDeckDetailRootQueryKey =
  typingServiceQueryKeys.deckDetailRoot;
export const typingDeckDetailQueryKey = typingServiceQueryKeys.deckDetail;

function withAdminQuery(path: string, adminMode: boolean) {
  if (!adminMode) {
    return path;
  }
  return `${path}${path.includes("?") ? "&" : "?"}admin=1`;
}

export function useTypingDecks(scope: TypingDeckScope, adminMode = false) {
  return useQuery({
    queryKey: typingDecksQueryKey(scope, adminMode),
    queryFn: async () => {
      const params = new URLSearchParams({ scope });
      if (adminMode) {
        params.set("admin", "1");
      }
      return loadTypingDeckList(`/api/v1/typing-decks?${params.toString()}`);
    },
  });
}

export function useTypingDeckDetail(deckId: string | null, adminMode = false) {
  return useQuery({
    queryKey: typingDeckDetailQueryKey(deckId, adminMode),
    queryFn: async () => {
      if (!deckId) {
        throw new Error("덱을 선택해주세요.");
      }
      return loadTypingDeckDetail(
        withAdminQuery(`/api/v1/typing-decks/${deckId}`, adminMode)
      );
    },
    enabled: Boolean(deckId),
  });
}

function invalidateAllDeckLists(
  queryClient: ReturnType<typeof useQueryClient>
) {
  void queryClient.invalidateQueries({ queryKey: typingDecksRootQueryKey() });
}

function invalidateDeck(
  queryClient: ReturnType<typeof useQueryClient>,
  deckId: string
) {
  void queryClient.invalidateQueries({
    queryKey: typingDeckDetailRootQueryKey(deckId),
  });
  invalidateAllDeckLists(queryClient);
}

export function useCreateTypingDeck(adminMode = false) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateTypingDeckBody) => {
      const data = await requestTypingDeck(
        withAdminQuery("/api/v1/typing-decks", adminMode),
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        },
        "타자 덱을 만들지 못했습니다."
      );
      return data.deck;
    },
    onSuccess: () => invalidateAllDeckLists(queryClient),
  });
}

export function useUpdateTypingDeck(deckId: string, adminMode = false) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateTypingDeckBody) => {
      const data = await requestTypingDeck(
        withAdminQuery(`/api/v1/typing-decks/${deckId}`, adminMode),
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        },
        "타자 덱을 수정하지 못했습니다."
      );
      return data.deck;
    },
    onSuccess: () => invalidateDeck(queryClient, deckId),
  });
}

export function useDeleteTypingDeck(adminMode = false) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (deckId: string) => {
      await typingServiceFetchVoid(
        withAdminQuery(`/api/v1/typing-decks/${deckId}`, adminMode),
        { method: "DELETE" },
        "타자 덱을 삭제하지 못했습니다."
      );
      return deckId;
    },
    onSuccess: () => invalidateAllDeckLists(queryClient),
  });
}

export function useCreateTypingDeckPassage(deckId: string, adminMode = false) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateTypingDeckPassageBody) => {
      const data = await requestTypingDeckPassage(
        withAdminQuery(`/api/v1/typing-decks/${deckId}/passages`, adminMode),
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        },
        "문단을 추가하지 못했습니다."
      );
      return data.passage;
    },
    onSuccess: () => invalidateDeck(queryClient, deckId),
  });
}

export function useBulkCreateTypingDeckPassages(
  deckId: string,
  adminMode = false
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateTypingDeckPassagesBody) => {
      const data = await typingServiceFetchJson<{
        passages: TypingDeckPassageDto[];
      }>(
        withAdminQuery(
          `/api/v1/typing-decks/${deckId}/passages/bulk`,
          adminMode
        ),
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        },
        "문단을 일괄 추가하지 못했습니다."
      );
      return data.passages;
    },
    onSuccess: () => invalidateDeck(queryClient, deckId),
  });
}

export function useUpdateTypingDeckPassage(deckId: string, adminMode = false) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      passageId: string;
      body: UpdateTypingDeckPassageBody;
    }) => {
      const data = await requestTypingDeckPassage(
        withAdminQuery(
          `/api/v1/typing-decks/${deckId}/passages/${params.passageId}`,
          adminMode
        ),
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(params.body),
        },
        "문단을 수정하지 못했습니다."
      );
      return data.passage;
    },
    onSuccess: () => invalidateDeck(queryClient, deckId),
  });
}

export function useDeleteTypingDeckPassage(deckId: string, adminMode = false) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (passageId: string) => {
      await typingServiceFetchVoid(
        withAdminQuery(
          `/api/v1/typing-decks/${deckId}/passages/${passageId}`,
          adminMode
        ),
        { method: "DELETE" },
        "문단을 삭제하지 못했습니다."
      );
      return passageId;
    },
    onSuccess: () => invalidateDeck(queryClient, deckId),
  });
}
