"use client";
import { CARD_SERVICE_COMMON_CLASS } from "../card-service-common.const";
import { YeonButton, YeonText, YeonView } from "@yeon/ui";

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
    <YeonView className="flex w-full max-w-[720px] items-center justify-between">
      <YeonButton type="button" onClick={onPrev} disabled={!canPrev}>
        ← 이전
      </YeonButton>
      <YeonText
        as="span"
        variant="unstyled"
        tone="inherit"
        className={CARD_SERVICE_COMMON_CLASS.panelTextEmphasis}
      >
        {currentIndex + 1} / {totalCount}
      </YeonText>
      <YeonButton type="button" onClick={onNext} disabled={!canNext}>
        다음 →
      </YeonButton>
    </YeonView>
  );
}
