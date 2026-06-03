import {
  yeonColors,
  yeonRadius,
  yeonSpacing,
  yeonTypography,
} from "@yeon/design-tokens";

import type { YeonBadgeVariant } from "./types";
import { joinClassNames } from "../../utils";

export const yeonBadgeWebVariants: Record<YeonBadgeVariant, string> = {
  neutral: "border border-[#e5e5e5] bg-white text-[#666]",
  success: "border border-[#e5e5e5] bg-[#fafafa] text-[#111]",
  warning: "border border-[#e5e5e5] bg-[#fafafa] text-[#666]",
  danger: "border border-[#e5e5e5] bg-white text-[#111]",
  accent: "border border-[#111] bg-white text-[#111]",
};

export function getYeonBadgeClassName({
  variant = "neutral",
  className,
}: {
  variant?: YeonBadgeVariant;
  className?: string;
} = {}) {
  return joinClassNames(
    "inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold",
    yeonBadgeWebVariants[variant],
    className
  );
}

export function getYeonBadgeNativeStyle(variant: YeonBadgeVariant = "neutral") {
  const variantStyle = {
    neutral: {
      backgroundColor: yeonColors.white,
      borderColor: yeonColors.neutral[100],
      color: yeonColors.neutral[600],
    },
    success: {
      backgroundColor: yeonColors.neutral[50],
      borderColor: yeonColors.neutral[100],
      color: yeonColors.black,
    },
    warning: {
      backgroundColor: yeonColors.neutral[50],
      borderColor: yeonColors.neutral[100],
      color: yeonColors.neutral[600],
    },
    danger: {
      backgroundColor: yeonColors.white,
      borderColor: yeonColors.mobile.border,
      color: yeonColors.mobile.error,
    },
    accent: {
      backgroundColor: yeonColors.white,
      borderColor: yeonColors.black,
      color: yeonColors.black,
    },
  }[variant];

  return {
    alignSelf: "flex-start" as const,
    backgroundColor: variantStyle.backgroundColor,
    borderColor: variantStyle.borderColor,
    borderRadius: yeonRadius.full,
    borderWidth: 1,
    color: variantStyle.color,
    fontSize: yeonTypography.fontSize.xs,
    fontWeight: yeonTypography.fontWeight.semibold,
    overflow: "hidden" as const,
    paddingHorizontal: 10,
    paddingVertical: yeonSpacing[1],
  };
}
