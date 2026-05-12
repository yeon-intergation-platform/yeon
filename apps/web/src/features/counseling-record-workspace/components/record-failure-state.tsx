import { Loader2 } from "lucide-react";
import { inferFailurePresentation } from "@/features/counseling-record-workspace/lib/record-failure-presentation";
import type { RecordItem } from "@/features/counseling-record-workspace/lib/types";

type RetryFeedback = {
  message: string | null;
  tone: "idle" | "success" | "error";
};

interface RecordFailureStateProps {
  selected: RecordItem;
  className: string;
  onRetryFailedRecord: () => void;
  onRetryFailedAnalysis: () => void;
  retryPending: boolean;
  retryFeedback: RetryFeedback;
}

export function RecordFailureState({
  selected,
  className,
  onRetryFailedRecord,
  onRetryFailedAnalysis,
  retryPending,
  retryFeedback,
}: RecordFailureStateProps) {
  const failure = inferFailurePresentation(selected);

  return (
    <div key={selected.id} className={className}>
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
