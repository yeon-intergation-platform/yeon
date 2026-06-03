import { yeonColors, yeonRadius } from "@yeon/design-tokens";

import type { YeonSurfaceVariant } from "./types";
import { joinClassNames } from "../../utils";

export const yeonSurfaceWebVariants: Record<YeonSurfaceVariant, string> = {
  plain: "bg-white",
  card: "rounded-2xl border border-[#e5e5e5] bg-white",
  panel: "rounded-2xl border border-[#e5e5e5] bg-[#fafafa]",
  empty:
    "rounded-2xl border border-dashed border-[#e5e5e5] bg-white text-center",
  loading: "rounded-2xl border border-[#e5e5e5] bg-white text-[#666]",
  subtle: "rounded-[18px] border border-[#e5e5e5] bg-[#fafafa]",
  outlined: "rounded-[18px] border border-[#e5e5e5] bg-white",
};

export function getYeonSurfaceClassName({
  variant = "card",
  className,
}: {
  variant?: YeonSurfaceVariant;
  className?: string;
} = {}) {
  return joinClassNames(yeonSurfaceWebVariants[variant], className);
}

export function getYeonSurfaceNativeStyle(
  variant: YeonSurfaceVariant = "card"
) {
  const base = {
    backgroundColor: yeonColors.white,
    borderRadius: yeonRadius.xl,
  };

  if (variant === "plain") return { backgroundColor: yeonColors.white };
  if (variant === "subtle" || variant === "panel") {
    return {
      ...base,
      backgroundColor: yeonColors.neutral[50],
      borderColor: yeonColors.neutral[100],
      borderWidth: 1,
    };
  }
  if (variant === "outlined" || variant === "empty" || variant === "loading") {
    return {
      ...base,
      borderColor: yeonColors.neutral[100],
      borderWidth: 1,
    };
  }
  return {
    ...base,
    borderColor: yeonColors.neutral[100],
    borderWidth: 1,
    shadowColor: yeonColors.black,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  };
}
