import type { CSSProperties, ReactNode } from "react";

import { YeonText } from "../../primitives/YeonText";
import { joinClassNames } from "../../utils";

export type YeonSectionTitleSpacing = "md" | "none" | "sm";

export type YeonSectionTitleProps = {
  children: ReactNode;
  className?: string;
  spacing?: YeonSectionTitleSpacing;
  style?: CSSProperties;
};

const spacingClassNames: Record<YeonSectionTitleSpacing, string> = {
  md: "mb-[14px]",
  none: "mb-0",
  sm: "mb-3",
};

export function YeonSectionTitle({
  children,
  className,
  spacing = "md",
  style,
}: YeonSectionTitleProps) {
  return (
    <YeonText
      as="h2"
      variant="unstyled"
      tone="inherit"
      className={joinClassNames(
        "text-[18px] font-black text-[#111]",
        spacingClassNames[spacing],
        className
      )}
      style={style}
    >
      {children}
    </YeonText>
  );
}
