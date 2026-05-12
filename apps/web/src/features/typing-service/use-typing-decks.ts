"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateTypingDeckBody,
  CreateTypingDeckPassageBody,
  CreateTypingDeckPassagesBody,
  TypingDeckDetailResponse,
  TypingDeckDto,
  TypingDeckLanguageTag,
  TypingDeckListResponse,
  TypingDeckListScope as TypingDeckScope,
  TypingDeckPassageDto,
  TypingDeckResponse,
  TypingDeckVisibility,
  TypingPassageDifficulty,
  TypingDeckPassageResponse,
  TypingPassageTextType,
  UpdateTypingDeckBody,
  UpdateTypingDeckPassageBody,
} from "@yeon/api-contract/typing-decks";

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

async function ensureOk(
  res: Response,
  fallbackErrorMessage: string
): Promise<void> {
  if (res.ok) return;
  const text = await res.text().catch(() => "");
  try {
    const parsed = text ? (JSON.parse(text) as { message?: string }) : null;
    throw new Error(parsed?.message || fallbackErrorMessage);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(fallbackErrorMessage);
  }
}

async function typingDecksFetchJson<T>(
  input: RequestInfo | URL,
  init: RequestInit,
  fallbackErrorMessage: string
): Promise<T> {
  const res = await fetch(input, { credentials: "include", ...init });
  await ensureOk(res, fallbackErrorMessage);
  return (await res.json()) as T;
}

async function typingDecksFetchVoid(
  input: RequestInfo | URL,
  init: RequestInit,
  fallbackErrorMessage: string
): Promise<void> {
  const res = await fetch(input, { credentials: "include", ...init });
  await ensureOk(res, fallbackErrorMessage);
}

export function typingDecksRootQueryKey() {
  return ["typing-decks"] as const;
}

export function typingDecksQueryKey(scope: TypingDeckScope, adminMode = false) {
  return [
    ...typingDecksRootQueryKey(),
    scope,
    adminMode ? "admin" : "user",
  ] as const;
}

export function typingDeckDetailRootQueryKey(deckId: string | null) {
  return ["typing-deck", deckId] as const;
}

export function typingDeckDetailQueryKey(
  deckId: string | null,
  adminMode = false
) {
  return [
    ...typingDeckDetailRootQueryKey(deckId),
    adminMode ? "admin" : "user",
  ] as const;
}

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
      return typingDecksFetchJson<TypingDeckListResponse>(
        `/api/v1/typing-decks?${params.toString()}`,
        { method: "GET" },
        "타자 덱 목록을 불러오지 못했습니다."
      );
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
      return typingDecksFetchJson<TypingDeckDetailResponse>(
        withAdminQuery(`/api/v1/typing-decks/${deckId}`, adminMode),
        { method: "GET" },
        "타자 덱을 불러오지 못했습니다."
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
      const data = await typingDecksFetchJson<TypingDeckResponse>(
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
      const data = await typingDecksFetchJson<TypingDeckResponse>(
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
      await typingDecksFetchVoid(
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
      const data = await typingDecksFetchJson<TypingDeckPassageResponse>(
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
      const data = await typingDecksFetchJson<{
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
      const data = await typingDecksFetchJson<TypingDeckPassageResponse>(
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
      await typingDecksFetchVoid(
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
