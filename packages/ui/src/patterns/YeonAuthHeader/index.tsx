import type { ReactNode } from "react";

import { YeonText } from "../../primitives/YeonText";
import { YeonView } from "../../primitives/YeonView";
import { joinClassNames } from "../../utils";

export type YeonAuthHeaderProps = {
  brand: ReactNode;
  className?: string;
  title: ReactNode;
};

export function YeonAuthHeader({
  brand,
  className,
  title,
}: YeonAuthHeaderProps) {
  return (
    <YeonView
      className={joinClassNames("grid justify-items-center gap-2.5", className)}
    >
      <YeonText
        variant="unstyled"
        tone="inherit"
        className="text-center text-[15px] font-bold text-[#111]"
      >
        {brand}
      </YeonText>
      <YeonText
        variant="unstyled"
        tone="inherit"
        className="text-center text-[36px] font-black tracking-[-0.02em] text-[#111]"
      >
        {title}
      </YeonText>
    </YeonView>
  );
}
