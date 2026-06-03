import type { ReactNode } from "react";

import { YeonText } from "../../primitives/YeonText";
import { joinClassNames } from "../../utils";

export type YeonPostTextVariant = "body" | "hint" | "meta";

export type YeonPostTextProps = {
  children: ReactNode;
  className?: string;
  variant?: YeonPostTextVariant;
};

export function YeonPostText({
  children,
  className,
  variant = "body",
}: YeonPostTextProps) {
  return (
    <YeonText
      variant="unstyled"
      tone="inherit"
      className={joinClassNames(
        variant === "body"
          ? "text-[20px] font-bold leading-[30px] text-[#111]"
          : null,
        variant === "hint" ? "mt-3 text-[14px] leading-5 text-[#666]" : null,
        variant === "meta" ? "text-[12px] leading-[18px] text-[#666]" : null,
        className
      )}
    >
      {children}
    </YeonText>
  );
}
