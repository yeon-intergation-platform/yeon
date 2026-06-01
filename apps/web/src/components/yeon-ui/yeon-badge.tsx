import type { HTMLAttributes } from "react";

import { joinClassNames } from "./class-names";

export const YEON_BADGE_VARIANTS = {
  neutral: "border border-[#e5e5e5] bg-white text-[#666]",
  success: "border border-green-200 bg-green-50 text-green-700",
  warning: "border border-[#e5e5e5] bg-[#fafafa] text-[#666]",
  danger: "border border-red-200 bg-red-50 text-red-600",
  accent: "border border-[#111] bg-white text-[#111]",
} as const;

export type YeonBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof YEON_BADGE_VARIANTS;
};

export function YeonBadge({
  variant = "neutral",
  className,
  ...props
}: YeonBadgeProps) {
  return (
    <span
      className={joinClassNames(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold",
        YEON_BADGE_VARIANTS[variant],
        className
      )}
      {...props}
    />
  );
}
