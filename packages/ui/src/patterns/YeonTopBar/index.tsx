import type { ReactNode } from "react";

import { YeonButton } from "../../primitives/YeonButton";
import { YeonText } from "../../primitives/YeonText";

export type YeonTopBarProps = {
  onRightPress?: () => void;
  rightLabel?: string;
  rightSlot?: ReactNode;
  subtitle?: string;
  title: string;
};

export function YeonTopBar({
  onRightPress,
  rightLabel,
  rightSlot,
  subtitle,
  title,
}: YeonTopBarProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="grid gap-1.5">
        <YeonText variant="title" className="tracking-[-0.03em]">
          {title}
        </YeonText>
        {subtitle ? (
          <YeonText
            variant="body"
            tone="secondary"
            className="text-[14px] leading-5"
          >
            {subtitle}
          </YeonText>
        ) : null}
      </div>
      {rightSlot ? (
        rightSlot
      ) : rightLabel && onRightPress ? (
        <YeonButton
          aria-label={rightLabel}
          onClick={onRightPress}
          size="sm"
          variant="pill"
          className="px-3.5 py-2.5 text-[13px] font-extrabold"
        >
          {rightLabel}
        </YeonButton>
      ) : null}
    </div>
  );
}
