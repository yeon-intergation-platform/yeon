"use client";
import {
  useYeonMutation as useMutation,
  useYeonQueryClient as useQueryClient,
} from "@yeon/ui/runtime/YeonQuery";
import type { MergeGuestResponse } from "@yeon/api-contract/card-deck-merge-guest";
import { delayYeon } from "@yeon/ui/runtime/YeonBrowserRuntime";
import {
  clearGuestCardDecksByPublicIds,
  dumpGuestCardDecksForMerge,
} from "@/lib/guest-card-service-store";
import { mergeGuestCardDecksToServer } from "../card-service-fetch";
import { cardServiceQueryKeys } from "../card-service-query-keys";

const CLEAR_MAX_ATTEMPTS = 3;
const CLEAR_BACKOFF_MS = 100;

async function clearWithRetry(publicIds: string[]): Promise<void> {
  for (let attempt = 0; attempt < CLEAR_MAX_ATTEMPTS; attempt += 1) {
    try {
      await clearGuestCardDecksByPublicIds(publicIds);
      return;
    } catch (error) {
      if (attempt === CLEAR_MAX_ATTEMPTS - 1) {
        // 서버 merge 는 이미 완료됐으므로 로컬 정리 실패를 mutation 실패로 전환하지 않는다.
        console.error(
          "guest 덱 로컬 정리 최종 실패 — 새로고침 시 자동 재시도됩니다.",
          { error, attempts: CLEAR_MAX_ATTEMPTS }
        );
        return;
      }
      await delayYeon(CLEAR_BACKOFF_MS * (attempt + 1));
    }
  }
}

export function useMergeGuestDecks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<MergeGuestResponse> => {
      const { payload, deckPublicIds } = await dumpGuestCardDecksForMerge();
      const result = await mergeGuestCardDecksToServer(payload);
      // dump 시점 snapshot 의 publicId 만 제거 — 이관 중 다른 탭이 만든 덱은 보존.
      await clearWithRetry(deckPublicIds);
      return result;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: cardServiceQueryKeys.decks(true),
      });
      void queryClient.invalidateQueries({
        queryKey: cardServiceQueryKeys.decks(false),
      });
    },
  });
}
