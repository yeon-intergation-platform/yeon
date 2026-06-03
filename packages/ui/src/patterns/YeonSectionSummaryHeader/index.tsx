import type { ReactNode } from "react";

import { YeonText } from "../../primitives/YeonText";
import { YeonView } from "../../primitives/YeonView";

export type YeonSectionSummaryHeaderProps = {
  meta?: ReactNode;
  title: ReactNode;
};

export function YeonSectionSummaryHeader({
  meta,
  title,
}: YeonSectionSummaryHeaderProps) {
  return (
    <YeonView className="flex items-center justify-between gap-3">
      <YeonText
        variant="unstyled"
        tone="inherit"
        className="text-[22px] font-extrabold text-[#111]"
      >
        {title}
      </YeonText>
      {meta ? (
        <YeonText
          variant="unstyled"
          tone="inherit"
          className="text-[13px] text-[#666]"
        >
          {meta}
        </YeonText>
      ) : null}
    </YeonView>
  );
}
