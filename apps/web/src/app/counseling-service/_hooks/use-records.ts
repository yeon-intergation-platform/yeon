"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CounselingRecordListItem,
  CounselingRecordDetail,
} from "@yeon/api-contract/counseling-records";
import type { RecordItem, AiMessage } from "../_lib/types";
import { getProcessingChecklistStep } from "../_lib/processing-progress";
import {
  clearCounselingRecordChat,
  fetchCounselingRecordDetail,
  fetchCounselingRecords,
} from "@/features/counseling-record-workspace/api/counseling-records-api";
import { counselingWorkspaceQueryKeys } from "@/features/counseling-record-workspace/api/counseling-workspace-query-keys";
import { useCounselingRecordLocalState } from "@/features/counseling-record-workspace/hooks/use-counseling-record-local-state";
import { useCounselingRecordsViewState } from "@/features/counseling-record-workspace/hooks/use-counseling-records-view-state";
import { useMergedRecords } from "./use-merged-records";
import {
  detailToRecordPatch,
  needsBackgroundPolling,
} from "../_lib/record-state-adapters";

const POLL_INTERVAL_MS = 3000;
const BOOSTED_POLL_INTERVAL_MS = 1000;
const BOOSTED_POLL_WINDOW_MS = 15000;
const EMPTY_SERVER_ITEMS: CounselingRecordListItem[] = [];

// ---------------------------------------------------------------------------
// selectedRecordId를 외부에서 받는 순수 데이터 훅
// 선택 상태는 useWorkspaceSelection이 소유한다.
// ---------------------------------------------------------------------------

export function useRecords(selectedRecordId: string | null) {
  const queryClient = useQueryClient();

  const {
    localOverrides,
    tempRecords,
    patchRecord,
    addProcessingRecord,
    addReadyRecord: addReadyRecordState,
    replaceRecord: replaceRecordState,
    removeRecordState,
    markUploadError,
    updateMessages,
    clearMessages: clearLocalMessages,
    markAnalysisRetryStart: markAnalysisRetryStartState,
    updateAnalysisResult,
    updateMemberId,
  } = useCounselingRecordLocalState<RecordItem, AiMessage>();
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [pollBoostUntil, setPollBoostUntil] = useState<number>(0);

  // 서버 목록 쿼리
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

  // 병합된 records (서버 + 로컬 오버라이드 + 임시 레코드)
  const serverItems = serverData?.records ?? EMPTY_SERVER_ITEMS;
  const records = useMergedRecords({
    serverItems,
    localOverrides,
    tempRecords,
  });

  // selected: 외부에서 받은 selectedRecordId로 파생
  const selected = useMemo(
    () => records.find((r) => r.id === selectedRecordId) ?? null,
    [records, selectedRecordId]
  );

  // records를 ref로 유지 — ensureDetail이 항상 최신 목록을 읽되 deps에는 넣지 않는다
  const recordsRef = useRef(records);
  recordsRef.current = records;

  // 서버에서 processing → ready 전환 감지 (이전 데이터와 비교)
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

  const processingStep = useMemo(() => {
    if (selected?.status !== "processing") {
      return 0;
    }

    return getProcessingChecklistStep({
      processingStage: selected.processingStage,
      analysisStatus: selected.analysisStatus,
    });
  }, [selected?.analysisStatus, selected?.processingStage, selected?.status]);

  const fetchDetail = useCallback(
    async (id: string) => {
      setTranscriptLoading(true);
      try {
        const data = await queryClient.fetchQuery({
          queryKey: counselingWorkspaceQueryKeys.record(id),
          queryFn: () => fetchCounselingRecordDetail(id),
          staleTime: 30_000,
        });

        const detailPatch = detailToRecordPatch(data.record);

        patchRecord(id, detailPatch);
      } catch {
        // detail 로드 실패는 무시
      } finally {
        setTranscriptLoading(false);
      }
    },
    [patchRecord, queryClient]
  );

  // ── ensureDetail: selectRecord의 데이터 전용 후속 (선택 상태 변경 없음) ──
  const ensureDetail = useCallback(
    (id: string) => {
      const currentRecords = recordsRef.current;
      const rec = currentRecords.find((r) => r.id === id);
      if (!rec) return;

      if (
        rec.status === "ready" &&
        (rec.transcript.length === 0 ||
          rec.analysisResult === null ||
          rec.aiMessagesLoaded !== true)
      ) {
        fetchDetail(id);
      }
    },
    [fetchDetail]
  );

  const addReadyRecord = useCallback(
    (record: RecordItem) => {
      addReadyRecordState(record);
      queryClient.invalidateQueries({
        queryKey: counselingWorkspaceQueryKeys.records(),
      });
      // 선택은 호출자가 selection.selectRecord(record.id)로 처리
    },
    [addReadyRecordState, queryClient]
  );

  const replaceRecord = useCallback(
    (tempId: string, realRecord: RecordItem) => {
      replaceRecordState(tempId, realRecord);
      queryClient.invalidateQueries({
        queryKey: counselingWorkspaceQueryKeys.records(),
      });
      // 선택 ID 교체는 호출자가 selection.replaceSelectedRecordId(tempId, realRecord.id)로 처리
    },
    [queryClient, replaceRecordState]
  );

  const removeRecord = useCallback(
    (id: string) => {
      removeRecordState(id);
      queryClient.invalidateQueries({
        queryKey: counselingWorkspaceQueryKeys.records(),
      });
      // 선택 해제는 호출자가 selection.clearRecordIfSelected(id)로 처리
    },
    [queryClient, removeRecordState]
  );

  const clearMessages = useCallback(
    async (id: string) => {
      await clearCounselingRecordChat(id);
      clearLocalMessages(id);
    },
    [clearLocalMessages]
  );

  const boostPolling = useCallback(() => {
    setPollBoostUntil(Date.now() + BOOSTED_POLL_WINDOW_MS);
  }, []);

  const markAnalysisRetryStart = useCallback(
    (id: string) => {
      markAnalysisRetryStartState(id);
      boostPolling();
      // 선택은 호출자가 이미 해당 record를 보고 있을 때만 호출
    },
    [boostPolling, markAnalysisRetryStartState]
  );

  const applyRecordDetail = useCallback(
    (detail: CounselingRecordDetail) => {
      const patch = detailToRecordPatch(detail);
      patchRecord(detail.id, patch);
      queryClient.setQueryData(counselingWorkspaceQueryKeys.record(detail.id), {
        record: detail,
      });
      queryClient.invalidateQueries({
        queryKey: counselingWorkspaceQueryKeys.records(),
      });
      if (needsBackgroundPolling(detail)) {
        boostPolling();
      }
      // 선택 변경은 호출자가 필요하면 selection.selectRecord(detail.id)로 처리
    },
    [boostPolling, patchRecord, queryClient]
  );

  // viewState — isRecording은 명시 상태, processing은 selected에서 파생
  const viewState = useCounselingRecordsViewState({
    isRecording,
    isPending,
    records,
    selected,
    processingStep,
  });

  const startRecording = useCallback(() => {
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
  }, []);

  const cancelRecording = useCallback(() => {
    setIsRecording(false);
  }, []);

  return {
    records,
    selected,
    viewState,
    processingStep,
    transcriptLoading,
    addProcessingRecord,
    addReadyRecord,
    replaceRecord,
    markUploadError,
    removeRecord,
    ensureDetail,
    updateMessages,
    clearMessages,
    updateAnalysisResult,
    updateMemberId,
    applyRecordDetail,
    markAnalysisRetryStart,
    boostPolling,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
