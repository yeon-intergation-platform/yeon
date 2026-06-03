import type { CSSProperties, ReactNode } from "react";

import { YeonView } from "../../primitives/YeonView";
import { joinClassNames } from "../../utils";

export type YeonFormBlockProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function YeonFormBlock({
  children,
  className,
  style,
}: YeonFormBlockProps) {
  return (
    <YeonView
      className={joinClassNames(
        "flex flex-col gap-[14px] rounded-[22px] border border-[#e5e5e5] bg-white p-[18px]",
        className
      )}
      style={style}
    >
      {children}
    </YeonView>
  );
}
