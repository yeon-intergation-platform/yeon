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
  run: (repository: YeonCardItemRepository, input: TInput) => Promise<TOutput>,
  options?: { invalidateOnSuccess?: boolean }
) {
  const queryClient = useQueryClient();
  const { isAuthenticated, markUnauthenticated } = useCardServiceAuth();
  const repository = useYeonCardItemRepository();
  const shouldInvalidateOnSuccess = options?.invalidateOnSuccess !== false;
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
    onSuccess: () => {
      if (!shouldInvalidateOnSuccess) {
        return;
      }
      invalidateDeckAndList(queryClient, isAuthenticated, deckId);
    },
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
  // 복습 채점은 카드 본문이 아니라 스케줄 메타데이터만 바꾸고, 그 값은 어디에도 표시되지 않는다.
  // play 중 deckDetail을 invalidate하면 무거운 카드 본문(MarkdownContent)이 재렌더되어
  // 다음 카드 전환에서 flicker가 난다. 순서·인덱스 네비게이션은 로컬에서 처리하므로 성공 시
  // invalidate를 생략한다(덱 화면 재진입 시 staleTime 기준으로 자연 갱신된다).
  return useDeckMutation(
    deckId,
    (
      repository,
      params: { itemId: string; difficulty: CardReviewDifficulty }
    ) => repository.reviewCard(deckId, params.itemId, params.difficulty),
    { invalidateOnSuccess: false }
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
