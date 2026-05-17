"use client";

import { CARD_SERVICE_COMMON_CLASS } from "../card-service-common.const";

interface PlayControlsProps {
  currentIndex: number;
  totalCount: number;
  onPrev: () => void;
  onNext: () => void;
}

export function PlayControls({
  currentIndex,
  totalCount,
  onPrev,
  onNext,
}: PlayControlsProps) {
  const canPrev = currentIndex > 0;
  const canNext = currentIndex < totalCount - 1;

  return (
    <div className="flex w-full max-w-[720px] items-center justify-between">
      <button
        type="button"
        onClick={onPrev}
        disabled={!canPrev}
        className="rounded-xl border border-[#e5e5e5] px-5 py-2 text-[14px] text-[#111] transition-colors hover:border-[#111] disabled:opacity-40"
      >
        ← 이전
      </button>
      <span className={CARD_SERVICE_COMMON_CLASS.panelTextEmphasis}>
        {currentIndex + 1} / {totalCount}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        className="rounded-xl border border-[#e5e5e5] px-5 py-2 text-[14px] text-[#111] transition-colors hover:border-[#111] disabled:opacity-40"
      >
        다음 →
      </button>
    </div>
  );
}
