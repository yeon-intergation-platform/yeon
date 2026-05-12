import { Loader2 } from "lucide-react";
import {
  PROCESSING_STEPS,
  getProcessingChecklistStep,
} from "@/features/counseling-record-workspace/lib/processing-progress";
import type { RecordItem } from "@/features/counseling-record-workspace/lib/types";

interface RecordProcessingStateProps {
  selected: RecordItem;
  className: string;
}

export function RecordProcessingState({
  selected,
  className,
}: RecordProcessingStateProps) {
  const resolvedProcessingStep = getProcessingChecklistStep({
    processingStage: selected.processingStage,
    analysisStatus: selected.analysisStatus,
  });

  return (
    <div key={selected.id} className={className}>
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
