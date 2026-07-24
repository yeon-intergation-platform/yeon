import { YeonView } from "../YeonView";
import { joinClassNames } from "../../utils";

export type YeonProgressBarProps = {
  className?: string;
  fillClassName?: string;
  label?: string;
  value: number;
};

function clampProgress(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

export function YeonProgressBar({
  className,
  fillClassName,
  label,
  value,
}: YeonProgressBarProps) {
  return (
    <YeonView
      aria-label={label}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={clampProgress(value)}
      className={joinClassNames(
        "h-2 overflow-hidden rounded-full bg-yeon-neutral-100",
        className
      )}
      role="progressbar"
    >
      <YeonView
        className={joinClassNames(
          "h-full rounded-full bg-[#111] transition-all",
          fillClassName
        )}
        style={{ width: `${clampProgress(value)}%` }}
      />
    </YeonView>
  );
}
