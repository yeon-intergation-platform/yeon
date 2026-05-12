import { Loader2 } from "lucide-react";
import { RecordAudioPlayer } from "@/features/counseling-record-workspace/components/record-audio-player";
import { TranscriptDetails } from "@/features/counseling-record-workspace/components/transcript-details";
import type { RecordItem } from "@/features/counseling-record-workspace/lib/types";

type RetryFeedback = {
  message: string | null;
  tone: "idle" | "success" | "error";
};

interface RecordPartialTranscriptStateProps {
  selected: RecordItem;
  className: string;
  transcriptLoading: boolean;
  isPlaying: boolean;
  audioPosition: number;
  totalSeconds: number;
  onTogglePlay: () => void;
  onSeek: (pct: number) => void;
  onRetryFailedRecord: () => void;
  retryPending: boolean;
  retryFeedback: RetryFeedback;
}

export function RecordPartialTranscriptState({
  selected,
  className,
  transcriptLoading,
  isPlaying,
  audioPosition,
  totalSeconds,
  onTogglePlay,
  onSeek,
  onRetryFailedRecord,
  retryPending,
  retryFeedback,
}: RecordPartialTranscriptStateProps) {
  return (
    <div key={selected.id} className={className}>
      <div className="px-5 py-3 border-b border-border flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5 min-w-0">
          <h1 className="text-[15px] font-semibold tracking-[-0.3px] truncate">
            {selected.title}
          </h1>
          <div className="text-[11px] text-text-dim flex items-center gap-1.5 flex-wrap">
            <span>{selected.studentName || "수강생 미지정"}</span>
            <span>·</span>
            <span>{selected.type}</span>
            <span>·</span>
            <span>{selected.duration}</span>
            <span>·</span>
            <span>부분 원문 준비</span>
          </div>
        </div>
      </div>

      <RecordAudioPlayer
        audioAvailable={selected.recordSource === "audio_upload"}
        isPlaying={isPlaying}
        audioPosition={audioPosition}
        totalSeconds={totalSeconds}
        onTogglePlay={onTogglePlay}
        onSeek={onSeek}
      />

      <div className="scrollbar-subtle flex-1 overflow-y-auto px-5 py-4">
        <div className="mb-4 rounded-lg border border-amber/30 bg-amber/10 px-4 py-3">
          <p className="m-0 text-[13px] font-semibold text-amber">
            원문 일부만 먼저 복구되었습니다
          </p>
          <p className="mt-1 mb-0 text-[12px] leading-relaxed text-text-secondary">
            {selected.processingMessage ||
              "누락된 전사 구간을 다시 시도해야 AI 분석을 시작할 수 있습니다."}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={onRetryFailedRecord}
              disabled={retryPending}
              className="inline-flex items-center gap-2 rounded-lg border border-accent-border bg-accent-dim px-4 py-2 text-[13px] font-semibold text-accent transition-colors hover:border-accent hover:bg-accent hover:text-bg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {retryPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : null}
              {retryPending ? "누락 구간 재시도 중..." : "누락 구간 다시 시도"}
            </button>
            <span className="text-[11px] text-text-dim">
              전사 구간 {selected.processingProgress}%
            </span>
          </div>
          {retryFeedback.message ? (
            <p
              className={`mt-3 mb-0 text-[12px] leading-relaxed ${
                retryFeedback.tone === "error"
                  ? "text-red"
                  : retryFeedback.tone === "success"
                    ? "text-accent"
                    : "text-text-dim"
              }`}
            >
              {retryFeedback.message}
            </p>
          ) : null}
        </div>

        <TranscriptDetails
          transcript={selected.transcript}
          loading={transcriptLoading}
          emptyMessage="부분 원문이 아직 준비되지 않았습니다."
          defaultOpen
        />
      </div>
    </div>
  );
}
