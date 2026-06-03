import type { CSSProperties, ReactNode } from "react";

import { YeonView } from "../../primitives/YeonView";
import { joinClassNames } from "../../utils";

export type YeonFormStackGap = "compact" | "default" | "roomy";

export type YeonFormStackProps = {
  children: ReactNode;
  className?: string;
  fill?: boolean;
  gap?: YeonFormStackGap;
  style?: CSSProperties;
};

const gapClassNames: Record<YeonFormStackGap, string> = {
  compact: "gap-2.5",
  default: "gap-3",
  roomy: "gap-4",
};

export function YeonFormStack({
  children,
  className,
  fill = false,
  gap = "default",
  style,
}: YeonFormStackProps) {
  return (
    <YeonView
      className={joinClassNames(
        "flex flex-col",
        fill ? "flex-1" : undefined,
        gapClassNames[gap],
        className
      )}
      style={style}
    >
      {children}
    </YeonView>
  );
}
