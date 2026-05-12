import { Loader2, Link2, Link2Off } from "lucide-react";
import styles from "../workspace.module.css";
import {
  PROCESSING_STEPS,
  getProcessingChecklistStep,
} from "../_lib/processing-progress";
import { inferFailurePresentation } from "../_lib/failure-presentation";
import type { RecordItem } from "../_lib/types";
import type { RecordMemberMismatchWarning } from "../_lib/record-member-mismatch";
import { AnalysisCards } from "@/features/counseling-record-workspace/components/analysis-cards";
import { RecordAudioPlayer } from "@/features/counseling-record-workspace/components/record-audio-player";
import { TranscriptDetails } from "@/features/counseling-record-workspace/components/transcript-details";

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
      <div
        className={`flex-1 flex flex-col overflow-hidden ${styles.centerFadeIn}`}
      >
        <div className="flex-1 flex items-center justify-center min-h-0">
          <div className="flex flex-col items-center gap-4 text-center max-w-[360px]">
            <p className="text-base font-medium">
              좌측 목록에서 기록을 선택하세요
            </p>
            <p className="m-0 text-sm leading-relaxed text-text-secondary">
              기록을 클릭하면 전사 원문과 AI 분석 결과를 확인할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* 에러 */
  if (selected.status === "error" || selected.analysisStatus === "error") {
    const failure = inferFailurePresentation(selected);
    return (
      <div
        key={selected.id}
        className={`flex-1 flex flex-col overflow-hidden ${styles.centerFadeIn}`}
      >
        <div className="px-5 py-4 border-b border-border flex items-start justify-between">
          <h1 className="text-[15px] font-semibold tracking-[-0.3px]">
            {selected.title}
          </h1>
          <div className="text-[11px] text-text-secondary mt-[3px] flex items-center gap-2">
            {selected.duration} · {failure.badge}
          </div>
        </div>
        <div className="scrollbar-subtle flex-1 overflow-y-auto px-5 py-4">
          <div className="flex flex-col items-center justify-center px-10 py-20 text-center">
            <p
              style={{
                fontWeight: 500,
                fontSize: 16,
                color: "var(--error, #e53e3e)",
              }}
            >
              {failure.title}
            </p>
            <p className="text-text-dim text-[13px] mt-2">
              {selected.errorMessage || "알 수 없는 오류가 발생했습니다."}
            </p>
            <p className="text-text-dim text-[12px] mt-2 max-w-[520px] leading-relaxed">
              {failure.description}
            </p>
            {failure.canRetry ? (
              <button
                type="button"
                onClick={() => {
                  if (failure.isAnalysisFailure) {
                    onRetryFailedAnalysis();
                    return;
                  }
                  onRetryFailedRecord();
                }}
                disabled={retryPending}
                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-accent-border bg-accent-dim px-4 py-2 text-[13px] font-semibold text-accent transition-colors hover:border-accent hover:bg-accent hover:text-bg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {retryPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : null}
                {retryPending ? "재시도 준비 중..." : failure.retryLabel}
              </button>
            ) : null}
            {retryFeedback.message ? (
              <p
                className={`mt-3 text-[12px] leading-relaxed ${
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
        </div>
      </div>
    );
  }

  const isPartialTranscriptReady =
    selected.status === "processing" &&
    selected.processingStage === "partial_transcript_ready";

  if (isPartialTranscriptReady) {
    return (
      <div
        key={selected.id}
        className={`flex-1 flex flex-col overflow-hidden ${styles.centerFadeIn}`}
      >
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
                {retryPending
                  ? "누락 구간 재시도 중..."
                  : "누락 구간 다시 시도"}
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

  /* 처리 중 */
  if (selected.status === "processing") {
    const resolvedProcessingStep = getProcessingChecklistStep({
      processingStage: selected.processingStage,
      analysisStatus: selected.analysisStatus,
    });

    return (
      <div
        key={selected.id}
        className={`flex-1 flex flex-col overflow-hidden ${styles.centerFadeIn}`}
      >
        <div className="px-5 py-4 border-b border-border flex items-start justify-between">
          <h1 className="text-[15px] font-semibold tracking-[-0.3px]">
            {selected.title}
          </h1>
          <div className="text-[11px] text-text-secondary mt-[3px]">
            {selected.duration} · AI 분석 중
          </div>
        </div>
        <div className="scrollbar-subtle flex-1 overflow-y-auto px-5 py-4">
          <div className="flex flex-col items-center justify-center px-10 py-20 text-center">
            <Loader2 size={36} className="animate-spin text-accent mb-4" />
            <p className="font-medium mt-4">음성을 분석하고 있습니다</p>
            <p className="text-text-dim text-[13px] mt-1">
              {selected.processingMessage ||
                "화자 분리 → 전사 → 화자 식별 → 상담 분석"}
            </p>
            <div className="mt-6 w-full max-w-[300px]">
              {PROCESSING_STEPS.map((step, i) => (
                <div
                  key={step.label}
                  className="flex items-center gap-2 py-[6px] text-[13px]"
                  style={{
                    color:
                      i < resolvedProcessingStep
                        ? "var(--accent)"
                        : "var(--text-dim)",
                  }}
                >
                  <span>
                    {i < resolvedProcessingStep
                      ? "✓"
                      : i === resolvedProcessingStep
                        ? "⟳"
                        : "○"}
                  </span>
                  <span>{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* 결과 */
  if (selected.status === "ready") {
    return (
      <div
        key={selected.id}
        className={`flex-1 flex flex-col overflow-hidden ${styles.centerFadeIn}`}
      >
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
              <span>원문 완료</span>
            </div>
          </div>
          <button
            onClick={onLinkMember}
            data-tutorial="link-member-btn"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border flex-shrink-0 transition-all duration-150 ${
              selected.memberId
                ? "bg-accent-dim border-accent-border text-accent hover:bg-accent hover:text-bg"
                : "bg-surface-2 border-border text-text-secondary hover:border-accent hover:text-accent"
            }`}
          >
            {selected.memberId ? <Link2 size={12} /> : <Link2Off size={12} />}
            {selected.memberId ? "연결됨" : "수강생 연결"}
          </button>
        </div>

        {mismatchWarning && (
          <div className="mx-5 mt-4 rounded-lg border border-amber/30 bg-amber/10 px-4 py-3">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-amber">⚠️</span>
              <div className="min-w-0">
                <p className="m-0 text-[13px] font-semibold text-amber">
                  {mismatchWarning.title}
                </p>
                <p className="mt-1 mb-0 text-[12px] leading-relaxed text-text-secondary">
                  {mismatchWarning.description}
                </p>
                <ul className="mt-2 mb-0 pl-4 text-[11px] leading-relaxed text-text-dim">
                  {mismatchWarning.evidence.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <RecordAudioPlayer
          audioAvailable={selected.recordSource === "audio_upload"}
          isPlaying={isPlaying}
          audioPosition={audioPosition}
          totalSeconds={totalSeconds}
          onTogglePlay={onTogglePlay}
          onSeek={onSeek}
          unavailableMessage="텍스트 메모에는 재생할 원본 음성이 없습니다."
        />

        {/* AI 분석 결과 */}
        <div className="scrollbar-subtle flex-1 overflow-y-auto px-5 py-4">
          {analyzing && !selected.analysisResult && (
            <div className="flex items-center gap-2 mb-4 px-4 py-3 bg-accent-dim border border-accent-border rounded-lg text-accent text-[13px] font-medium">
              <Loader2 size={14} className="animate-spin" />
              AI 분석 중...
            </div>
          )}

          {selected.analysisResult && (
            <AnalysisCards analysis={selected.analysisResult} />
          )}

          <TranscriptDetails
            transcript={selected.transcript}
            loading={transcriptLoading}
            emptyMessage="전사 내용이 없습니다."
            defaultOpen={!selected.analysisResult}
          />
        </div>
      </div>
    );
  }

  return null;
}
