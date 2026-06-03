import type { ReactNode } from "react";

import { YeonText } from "../../primitives/YeonText";
import { YeonView } from "../../primitives/YeonView";
import { joinClassNames } from "../../utils";

export type YeonInfoListItemTone = "accent" | "neutral";

export type YeonInfoListItemProps = {
  className?: string;
  meta?: ReactNode;
  subtitle?: ReactNode;
  title: ReactNode;
  titleTone?: YeonInfoListItemTone;
  trailingSlot?: ReactNode;
};

export function YeonInfoListItem({
  className,
  meta,
  subtitle,
  title,
  titleTone = "neutral",
  trailingSlot,
}: YeonInfoListItemProps) {
  return (
    <YeonView
      className={joinClassNames(
        "flex items-center justify-between gap-3 border-b border-[#e5e5e5] pb-2.5",
        className
      )}
    >
      <YeonView className="grid flex-1 gap-1">
        {meta ? (
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="text-[12px] font-extrabold text-[#111]"
          >
            {meta}
          </YeonText>
        ) : null}
        <YeonText
          variant="unstyled"
          tone="inherit"
          className={joinClassNames(
            "text-[14px] text-[#111]",
            titleTone === "accent" ? "text-[16px] font-extrabold" : null
          )}
        >
          {title}
        </YeonText>
        {subtitle ? (
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="text-[13px] text-[#666]"
          >
            {subtitle}
          </YeonText>
        ) : null}
      </YeonView>
      {trailingSlot ? (
        <YeonView className="shrink-0">{trailingSlot}</YeonView>
      ) : null}
    </YeonView>
  );
}
