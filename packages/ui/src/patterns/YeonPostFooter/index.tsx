import type { ReactNode } from "react";

import { YeonButton } from "../../primitives/YeonButton";
import { YeonText } from "../../primitives/YeonText";
import { YeonView } from "../../primitives/YeonView";
import { joinClassNames } from "../../utils";

export type YeonPostFooterProps = {
  actionLabel: ReactNode;
  className?: string;
  label: ReactNode;
  onActionPress?: () => void;
};

export function YeonPostFooter({
  actionLabel,
  className,
  label,
  onActionPress,
}: YeonPostFooterProps) {
  return (
    <YeonView
      className={joinClassNames("mt-3.5 flex justify-between", className)}
    >
      <YeonText
        variant="unstyled"
        tone="inherit"
        className="text-[13px] text-[#666]"
      >
        {label}
      </YeonText>
      <YeonButton
        onClick={onActionPress}
        size="sm"
        variant="ghost"
        className="min-h-0 border-0 p-0 text-[13px] font-extrabold text-[#111]"
      >
        {actionLabel}
      </YeonButton>
    </YeonView>
  );
}
