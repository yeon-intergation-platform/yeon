import type { ReactNode } from "react";

import { YeonText } from "../../primitives/YeonText";
import { YeonView } from "../../primitives/YeonView";
import { joinClassNames } from "../../utils";

export type YeonFormIntroProps = {
  className?: string;
  hint?: ReactNode;
  title: ReactNode;
};

export function YeonFormIntro({ className, hint, title }: YeonFormIntroProps) {
  return (
    <YeonView className={joinClassNames("mb-3 grid gap-1", className)}>
      <YeonText
        variant="unstyled"
        tone="inherit"
        className="text-[18px] font-black text-[#111]"
      >
        {title}
      </YeonText>
      {hint ? (
        <YeonText
          variant="unstyled"
          tone="inherit"
          className="text-[13px] text-[#666]"
        >
          {hint}
        </YeonText>
      ) : null}
    </YeonView>
  );
}
