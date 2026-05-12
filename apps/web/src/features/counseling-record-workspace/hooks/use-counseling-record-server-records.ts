"use client";

import { useCallback, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CounselingRecordDetail,
  CounselingRecordListItem,
} from "@yeon/api-contract/counseling-records";
import {
  fetchCounselingRecordDetail,
  fetchCounselingRecords,
} from "@/features/counseling-record-workspace/api/counseling-records-api";
import { counselingWorkspaceQueryKeys } from "@/features/counseling-record-workspace/api/counseling-workspace-query-keys";
import { needsBackgroundPolling } from "@/features/counseling-record-workspace/lib/record-state-adapters";

const POLL_INTERVAL_MS = 3000;
const BOOSTED_POLL_INTERVAL_MS = 1000;
const EMPTY_SERVER_ITEMS: CounselingRecordListItem[] = [];

type UseCounselingRecordServerRecordsParams = {
  pollBoostUntil: number;
};

export function useCounselingRecordServerRecords({
  pollBoostUntil,
}: UseCounselingRecordServerRecordsParams) {
  const queryClient = useQueryClient();

  const { data: serverData, isPending } = useQuery({
    queryKey: counselingWorkspaceQueryKeys.records(),
    queryFn: fetchCounselingRecords,
    refetchInterval: (query) => {
      const items = query.state.data?.records || [];
      if (!items.some((record) => needsBackgroundPolling(record))) {
        return false;
      }

      return Date.now() < pollBoostUntil
        ? BOOSTED_POLL_INTERVAL_MS
        : POLL_INTERVAL_MS;
    },
  });

  const prevServerDataRef = useRef<{
    records: CounselingRecordListItem[];
  } | null>(null);

  useEffect(() => {
    if (!serverData) return;

    const prev = prevServerDataRef.current;
    prevServerDataRef.current = serverData;

    if (!prev) return;

    const readyTransitioned = serverData.records.filter((item) => {
      const existing = prev.records.find((p) => p.id === item.id);
      return existing?.status === "processing" && item.status !== "processing";
    });

    for (const item of readyTransitioned) {
      queryClient.prefetchQuery({
        queryKey: counselingWorkspaceQueryKeys.record(item.id),
        queryFn: () => fetchCounselingRecordDetail(item.id),
      });
    }
  }, [serverData, queryClient]);

  const fetchDetail = useCallback(
    (id: string) =>
      queryClient.fetchQuery({
        queryKey: counselingWorkspaceQueryKeys.record(id),
        queryFn: () => fetchCounselingRecordDetail(id),
        staleTime: 30_000,
      }),
    [queryClient]
  );

  const cacheRecordDetail = useCallback(
    (detail: CounselingRecordDetail) => {
      queryClient.setQueryData(counselingWorkspaceQueryKeys.record(detail.id), {
        record: detail,
      });
    },
    [queryClient]
  );

  const invalidateRecords = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: counselingWorkspaceQueryKeys.records(),
    });
  }, [queryClient]);

  return {
    serverItems: serverData?.records ?? EMPTY_SERVER_ITEMS,
    isPending,
    fetchDetail,
    cacheRecordDetail,
    invalidateRecords,
  };
}
