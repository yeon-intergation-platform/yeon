import { useCallback, useEffect, useMemo, useState } from "react";
import {
  retryCounselingRecordAnalysis,
  retryCounselingRecordTranscription,
} from "@/features/counseling-record-workspace/api/counseling-records-api";
import type { CounselingRecordDetail } from "@yeon/api-contract/counseling-records";
import type { RecordItem } from "@/app/counseling-service/_lib/types";

type RetryFeedback = {
  message: string | null;
  tone: "idle" | "success" | "error";
};

type RecordRetryDeps = {
  selected: RecordItem | null;
  applyRecordDetail: (detail: CounselingRecordDetail) => void;
  boostPolling: () => void;
  markAnalysisRetryStart: (id: string) => void;
  selectRecord: (id: string) => void;
};

function canRetryTranscription(selected: RecordItem | null) {
  return (
    !!selected &&
    (selected.status === "error" ||
      (selected.status === "processing" &&
        selected.processingStage === "partial_transcript_ready"))
  );
}

export function useRecordRetry({
  selected,
  applyRecordDetail,
  boostPolling,
  markAnalysisRetryStart,
  selectRecord,
}: RecordRetryDeps) {
  const [retryFailedRecordPending, setRetryFailedRecordPending] =
    useState(false);
  const [retryFailedAnalysisPending, setRetryFailedAnalysisPending] =
    useState(false);
  const [retryFeedback, setRetryFeedback] = useState<RetryFeedback>({
    message: null,
    tone: "idle",
  });

  useEffect(() => {
    setRetryFeedback({ message: null, tone: "idle" });
  }, [selected?.id]);

  const retryPending = retryFailedRecordPending || retryFailedAnalysisPending;

  const retryFailedRecord = useCallback(async () => {
    const currentRecord = selected;

    if (
      !currentRecord ||
      !canRetryTranscription(currentRecord) ||
      retryFailedRecordPending
    ) {
      return;
    }

    setRetryFailedRecordPending(true);
    setRetryFeedback({ message: null, tone: "idle" });
    try {
      const data = await retryCounselingRecordTranscription(currentRecord.id);
      applyRecordDetail(data.record);
      boostPolling();
      setRetryFeedback({
        message:
          currentRecord.status === "error"
            ? "재전사를 다시 시작했습니다. 처리 중 상태를 자동으로 더 자주 갱신합니다."
            : "누락된 전사 구간 재시도를 시작했습니다. 복구가 끝나면 AI 분석을 이어갈 수 있습니다.",
        tone: "success",
      });
    } catch (error) {
      setRetryFeedback({
        message:
          error instanceof Error
            ? error.message
            : "과거 실패 기록 재분석을 다시 시작하지 못했습니다.",
        tone: "error",
      });
    } finally {
      setRetryFailedRecordPending(false);
    }
  }, [applyRecordDetail, boostPolling, retryFailedRecordPending, selected]);

  const retryFailedAnalysis = useCallback(async () => {
    if (
      !selected ||
      selected.analysisStatus !== "error" ||
      retryFailedAnalysisPending
    ) {
      return;
    }

    setRetryFailedAnalysisPending(true);
    setRetryFeedback({ message: null, tone: "idle" });
    try {
      await retryCounselingRecordAnalysis(selected.id);

      markAnalysisRetryStart(selected.id);
      boostPolling();
      selectRecord(selected.id);
      setRetryFeedback({
        message:
          "AI 분석을 다시 시작했습니다. 처리 중 상태를 자동으로 더 자주 갱신합니다.",
        tone: "success",
      });
    } catch (error) {
      setRetryFeedback({
        message:
          error instanceof Error
            ? error.message
            : "AI 분석을 다시 시작하지 못했습니다.",
        tone: "error",
      });
    } finally {
      setRetryFailedAnalysisPending(false);
    }
  }, [
    boostPolling,
    markAnalysisRetryStart,
    retryFailedAnalysisPending,
    selectRecord,
    selected,
  ]);

  return useMemo(
    () => ({
      retryPending,
      retryFeedback,
      retryFailedRecord,
      retryFailedAnalysis,
    }),
    [retryFailedAnalysis, retryFailedRecord, retryFeedback, retryPending]
  );
}
