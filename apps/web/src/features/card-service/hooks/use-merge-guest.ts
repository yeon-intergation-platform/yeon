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

export function resolveMergeGuestCleanupPublicIds(
  result: Pick<MergeGuestResponse, "createdDeckCount">,
  deckPublicIds: readonly string[]
) {
  return result.createdDeckCount === deckPublicIds.length
    ? [...deckPublicIds]
    : [];
}

async function clearWithRetry(publicIds: string[]): Promise<void> {
  if (publicIds.length === 0) return;

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
      const cleanupPublicIds = resolveMergeGuestCleanupPublicIds(
        result,
        deckPublicIds
      );
      if (cleanupPublicIds.length === 0 && deckPublicIds.length > 0) {
        // 서버 응답이 snapshot count와 다르면 partial/불명확 성공으로 보고 로컬 데이터를 보존한다.
        console.error(
          "guest 덱 merge 결과가 snapshot 수와 달라 로컬 정리를 건너뜁니다.",
          {
            createdDeckCount: result.createdDeckCount,
            snapshotDeckCount: deckPublicIds.length,
          }
        );
      }
      // dump 시점 snapshot 의 publicId 만 제거 — 이관 중 다른 탭이 만든 덱은 보존.
      await clearWithRetry(cleanupPublicIds);
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
