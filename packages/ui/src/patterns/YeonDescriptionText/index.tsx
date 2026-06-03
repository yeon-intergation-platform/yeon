import type { CSSProperties, ReactNode } from "react";

import { YeonText } from "../../primitives/YeonText";
import { joinClassNames } from "../../utils";

export type YeonDescriptionTextLine = "default" | "roomy";

export type YeonDescriptionTextProps = {
  children: ReactNode;
  className?: string;
  line?: YeonDescriptionTextLine;
  style?: CSSProperties;
};

const lineClassNames: Record<YeonDescriptionTextLine, string> = {
  default: "leading-5",
  roomy: "leading-[22px]",
};

export function YeonDescriptionText({
  children,
  className,
  line = "default",
  style,
}: YeonDescriptionTextProps) {
  return (
    <YeonText
      variant="unstyled"
      tone="inherit"
      className={joinClassNames(
        "text-[14px] text-[#666]",
        lineClassNames[line],
        className
      )}
      style={style}
    >
      {children}
    </YeonText>
  );
}
