import styles from "../workspace.module.css";
import type { RecordItem } from "../_lib/types";
import type { RecordMemberMismatchWarning } from "@/features/counseling-record-workspace/lib/record-member-mismatch";
import { RecordEmptyState } from "@/features/counseling-record-workspace/components/record-empty-state";
import { RecordFailureState } from "@/features/counseling-record-workspace/components/record-failure-state";
import { RecordPartialTranscriptState } from "@/features/counseling-record-workspace/components/record-partial-transcript-state";
import { RecordProcessingState } from "@/features/counseling-record-workspace/components/record-processing-state";
import { RecordReadyState } from "@/features/counseling-record-workspace/components/record-ready-state";

type RetryFeedback = {
  message: string | null;
  tone: "idle" | "success" | "error";
};

export interface CenterPanelProps {
  phase: "processing" | "ready";
  selected: RecordItem | null;
  processingStep: number;
  transcriptLoading: boolean;
  analyzing: boolean;
  /* 오디오 */
  isPlaying: boolean;
  audioPosition: number;
  totalSeconds: number;
  onTogglePlay: () => void;
  onSeek: (pct: number) => void;
  onLinkMember: () => void;
  mismatchWarning: RecordMemberMismatchWarning | null;
  onRetryFailedRecord: () => void;
  onRetryFailedAnalysis: () => void;
  retryPending: boolean;
  retryFeedback: RetryFeedback;
}

export function CenterPanel({
  phase: _phase,
  selected,
  processingStep: _processingStep,
  transcriptLoading,
  analyzing,
  isPlaying,
  audioPosition,
  totalSeconds,
  onTogglePlay,
  onSeek,
  onLinkMember,
  mismatchWarning,
  onRetryFailedRecord,
  onRetryFailedAnalysis,
  retryPending,
  retryFeedback,
}: CenterPanelProps) {
  /* 기록 목록은 있지만 아직 선택하지 않은 상태 */
  if (!selected) {
    return (
      <RecordEmptyState
        className={`flex-1 flex flex-col overflow-hidden ${styles.centerFadeIn}`}
      />
    );
  }

  /* 에러 */
  if (selected.status === "error" || selected.analysisStatus === "error") {
    return (
      <RecordFailureState
        selected={selected}
        className={`flex-1 flex flex-col overflow-hidden ${styles.centerFadeIn}`}
        onRetryFailedRecord={onRetryFailedRecord}
        onRetryFailedAnalysis={onRetryFailedAnalysis}
        retryPending={retryPending}
        retryFeedback={retryFeedback}
      />
    );
  }

  const isPartialTranscriptReady =
    selected.status === "processing" &&
    selected.processingStage === "partial_transcript_ready";

  if (isPartialTranscriptReady) {
    return (
      <RecordPartialTranscriptState
        selected={selected}
        className={`flex-1 flex flex-col overflow-hidden ${styles.centerFadeIn}`}
        transcriptLoading={transcriptLoading}
        isPlaying={isPlaying}
        audioPosition={audioPosition}
        totalSeconds={totalSeconds}
        onTogglePlay={onTogglePlay}
        onSeek={onSeek}
        onRetryFailedRecord={onRetryFailedRecord}
        retryPending={retryPending}
        retryFeedback={retryFeedback}
      />
    );
  }

  /* 처리 중 */
  if (selected.status === "processing") {
    return (
      <RecordProcessingState
        selected={selected}
        className={`flex-1 flex flex-col overflow-hidden ${styles.centerFadeIn}`}
      />
    );
  }

  /* 결과 */
  if (selected.status === "ready") {
    return (
      <RecordReadyState
        selected={selected}
        className={`flex-1 flex flex-col overflow-hidden ${styles.centerFadeIn}`}
        transcriptLoading={transcriptLoading}
        analyzing={analyzing}
        isPlaying={isPlaying}
        audioPosition={audioPosition}
        totalSeconds={totalSeconds}
        onTogglePlay={onTogglePlay}
        onSeek={onSeek}
        onLinkMember={onLinkMember}
        mismatchWarning={mismatchWarning}
      />
    );
  }

  return null;
}
