"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { CounselingRecordDetail } from "@yeon/api-contract/counseling-records";
import type {
  RecordItem,
  AiMessage,
} from "@/features/counseling-record-workspace/lib/types";
import { getProcessingChecklistStep } from "@/features/counseling-record-workspace/lib/processing-progress";
import { clearCounselingRecordChat } from "@/features/counseling-record-workspace/api/counseling-records-api";
import { useCounselingRecordLocalState } from "@/features/counseling-record-workspace/hooks/use-counseling-record-local-state";
import { useCounselingRecordsViewState } from "@/features/counseling-record-workspace/hooks/use-counseling-records-view-state";
import { useMergedRecords } from "@/features/counseling-record-workspace/hooks/use-merged-records";
import { useCounselingRecordServerRecords } from "@/features/counseling-record-workspace/hooks/use-counseling-record-server-records";
import {
  detailToRecordPatch,
  needsBackgroundPolling,
} from "@/features/counseling-record-workspace/lib/record-state-adapters";

const BOOSTED_POLL_WINDOW_MS = 15000;

// ---------------------------------------------------------------------------
// selectedRecordId를 외부에서 받는 순수 데이터 훅
// 선택 상태는 useWorkspaceSelection이 소유한다.
// ---------------------------------------------------------------------------

export function useRecords(selectedRecordId: string | null) {
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

  const {
    serverItems,
    isPending,
    fetchDetail: fetchServerDetail,
    cacheRecordDetail,
    invalidateRecords,
  } = useCounselingRecordServerRecords({ pollBoostUntil });

  // 병합된 records (서버 + 로컬 오버라이드 + 임시 레코드)
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
        const data = await fetchServerDetail(id);
        const detailPatch = detailToRecordPatch(data.record);

        patchRecord(id, detailPatch);
      } catch {
        // detail 로드 실패는 무시
      } finally {
        setTranscriptLoading(false);
      }
    },
    [fetchServerDetail, patchRecord]
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
      invalidateRecords();
      // 선택은 호출자가 selection.selectRecord(record.id)로 처리
    },
    [addReadyRecordState, invalidateRecords]
  );

  const replaceRecord = useCallback(
    (tempId: string, realRecord: RecordItem) => {
      replaceRecordState(tempId, realRecord);
      invalidateRecords();
      // 선택 ID 교체는 호출자가 selection.replaceSelectedRecordId(tempId, realRecord.id)로 처리
    },
    [invalidateRecords, replaceRecordState]
  );

  const removeRecord = useCallback(
    (id: string) => {
      removeRecordState(id);
      invalidateRecords();
      // 선택 해제는 호출자가 selection.clearRecordIfSelected(id)로 처리
    },
    [invalidateRecords, removeRecordState]
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
      cacheRecordDetail(detail);
      invalidateRecords();
      if (needsBackgroundPolling(detail)) {
        boostPolling();
      }
      // 선택 변경은 호출자가 필요하면 selection.selectRecord(detail.id)로 처리
    },
    [boostPolling, cacheRecordDetail, invalidateRecords, patchRecord]
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
