"use client";

import type { RecordItem } from "@/features/counseling-record-workspace/lib/types";
import { fmtMs } from "@/features/counseling-record-workspace/lib/utils";
import { buildTranscriptDisplayBlocks } from "@/lib/counseling-transcript-display";

type TranscriptSegment = RecordItem["transcript"][number];

const EMPTY_TRANSCRIPT_DISPLAY_BLOCKS: ReturnType<
  typeof buildTranscriptDisplayBlocks
> = [];

interface TranscriptDetailsProps {
  transcript: TranscriptSegment[];
  loading: boolean;
  emptyMessage: string;
  defaultOpen: boolean;
}

function buildTranscriptSummaryText(transcript: TranscriptSegment[]) {
  const transcriptDisplayBlocks =
    transcript.length > 0
      ? buildTranscriptDisplayBlocks(transcript)
      : EMPTY_TRANSCRIPT_DISPLAY_BLOCKS;

  if (transcriptDisplayBlocks.length > 0) {
    return `화자 턴 ${transcriptDisplayBlocks.length}개 · ${transcript.length}개 세그먼트`;
  }

  if (transcript.length > 0) {
    return `${transcript.length}개 세그먼트`;
  }

  return "";
}

export function TranscriptDetails({
  transcript,
  loading,
  emptyMessage,
  defaultOpen,
}: TranscriptDetailsProps) {
  const transcriptSummaryText = buildTranscriptSummaryText(transcript);

  return (
    <details className="mt-4" open={defaultOpen}>
      <summary className="text-[13px] font-semibold text-text-secondary cursor-pointer select-none mb-3 hover:text-text transition-colors">
        전사 원문 {transcriptSummaryText && `(${transcriptSummaryText})`}
      </summary>
      {loading ? (
        <div className="text-text-dim text-[13px] py-6">
          전사 내용을 불러오는 중...
        </div>
      ) : transcript.length === 0 ? (
        <div className="text-text-dim text-[13px] py-6">{emptyMessage}</div>
      ) : (
        transcript.map((segment, index) => (
          <div
            key={segment.id ?? index}
            className="flex gap-[10px] py-2 border-b border-[rgba(255,255,255,0.03)] text-[13px]"
          >
            <span className="font-mono text-[10px] text-text-dim min-w-[38px] pt-[3px]">
              {fmtMs(segment.startMs)}
            </span>
            <span
              className={`text-[10px] font-semibold min-w-[32px] pt-[3px] ${
                segment.speakerTone === "teacher"
                  ? "text-[#60a5fa]"
                  : "text-green"
              }`}
            >
              {segment.speakerLabel}
            </span>
            <span className="flex-1 text-text">{segment.text}</span>
          </div>
        ))
      )}
    </details>
  );
}
