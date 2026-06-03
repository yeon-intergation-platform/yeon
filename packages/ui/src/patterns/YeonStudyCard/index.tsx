import type { ReactNode } from "react";

import { YeonButton } from "../../primitives/YeonButton";
import { YeonText } from "../../primitives/YeonText";
import { YeonView } from "../../primitives/YeonView";
import { joinClassNames } from "../../utils";

export type YeonStudyCardProps = {
  accessibilityLabel?: string;
  body: ReactNode;
  className?: string;
  hint?: ReactNode;
  label: ReactNode;
  onPress?: () => void;
};

export function YeonStudyCard({
  accessibilityLabel,
  body,
  className,
  hint,
  label,
  onPress,
}: YeonStudyCardProps) {
  return (
    <YeonButton
      aria-label={accessibilityLabel}
      onClick={onPress}
      variant="secondary"
      className={joinClassNames(
        "flex min-h-[320px] flex-1 flex-col rounded-[20px] border border-[#e5e5e5] bg-white p-6 text-left",
        className
      )}
    >
      <YeonText
        variant="caption"
        tone="secondary"
        className="text-[13px] font-black tracking-[0.08em]"
      >
        {label}
      </YeonText>
      <YeonView className="flex flex-1 items-start justify-center overflow-auto">
        <YeonText
          variant="subtitle"
          tone="primary"
          className="mt-5 text-[22px] font-bold leading-[34px]"
        >
          {body}
        </YeonText>
      </YeonView>
      {hint ? (
        <YeonText
          tone="secondary"
          className="mt-[18px] text-center text-[13px]"
        >
          {hint}
        </YeonText>
      ) : null}
    </YeonButton>
  );
}
