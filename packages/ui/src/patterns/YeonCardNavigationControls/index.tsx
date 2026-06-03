import { YeonButton } from "../../primitives/YeonButton";
import { YeonView } from "../../primitives/YeonView";
import { joinClassNames } from "../../utils";

export type YeonCardNavigationControlsProps = {
  nextLabel: string;
  onNext: () => void;
  onPrev: () => void;
  prevLabel: string;
  canMoveNext: boolean;
  canMovePrev: boolean;
};

export function YeonCardNavigationControls({
  canMoveNext,
  canMovePrev,
  nextLabel,
  onNext,
  onPrev,
  prevLabel,
}: YeonCardNavigationControlsProps) {
  return (
    <YeonView className="flex gap-3">
      <YeonButton
        aria-label={prevLabel}
        disabled={!canMovePrev}
        onClick={onPrev}
        variant="secondary"
        className={joinClassNames(
          "min-h-14 flex-1 rounded-[14px] border border-[#e5e5e5] text-[16px] font-black text-[#111]",
          !canMovePrev ? "opacity-50" : undefined
        )}
      >
        {prevLabel}
      </YeonButton>
      <YeonButton
        aria-label={nextLabel}
        disabled={!canMoveNext}
        onClick={onNext}
        variant="primary"
        className={joinClassNames(
          "min-h-14 flex-1 rounded-[14px] bg-[#111] text-[16px] font-black text-white",
          !canMoveNext ? "opacity-50" : undefined
        )}
      >
        {nextLabel}
      </YeonButton>
    </YeonView>
  );
}
