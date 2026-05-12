"use client";

import { useMemo } from "react";

const PARTIAL_TRANSCRIPT_READY_STAGE = "partial_transcript_ready";

type ProcessingRecord = {
  status: "ready" | "processing" | "error";
  processingStage?: string;
};

export type CounselingRecordsViewState<TRecord> =
  | { kind: "loading" }
  | { kind: "empty" }
  | { kind: "recording" }
  | { kind: "processing"; step: number }
  | { kind: "ready"; records: TRecord[] };

function isPartialTranscriptReady(record: ProcessingRecord | null) {
  return (
    record?.status === "processing" &&
    record.processingStage === PARTIAL_TRANSCRIPT_READY_STAGE
  );
}

export function useCounselingRecordsViewState<
  TRecord extends ProcessingRecord,
>({
  isRecording,
  isPending,
  records,
  selected,
  processingStep,
}: {
  isRecording: boolean;
  isPending: boolean;
  records: TRecord[];
  selected: TRecord | null;
  processingStep: number;
}): CounselingRecordsViewState<TRecord> {
  return useMemo(() => {
    if (isRecording) return { kind: "recording" };
    if (isPending) return { kind: "loading" };
    if (records.length === 0) return { kind: "empty" };
    if (
      selected?.status === "processing" &&
      !isPartialTranscriptReady(selected)
    ) {
      return { kind: "processing", step: processingStep };
    }
    return { kind: "ready", records };
  }, [isRecording, isPending, processingStep, records, selected]);
}
