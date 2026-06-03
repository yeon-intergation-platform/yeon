import {
  yeonColors,
  yeonRadius,
  yeonSpacing,
  yeonTypography,
} from "@yeon/design-tokens";

import type { YeonButtonSize, YeonButtonVariant } from "./types";
import { joinClassNames } from "../../utils";

export const yeonButtonWebVariants: Record<YeonButtonVariant, string> = {
  primary:
    "border border-[#111] bg-[#111] text-white hover:opacity-90 focus-visible:ring-[#111]",
  secondary:
    "border border-[#e5e5e5] bg-white text-[#111] hover:border-[#111] focus-visible:ring-[#111]",
  ghost:
    "border border-transparent bg-transparent text-[#666] hover:text-[#111] focus-visible:ring-[#111]",
  danger:
    "border border-[#e5e5e5] bg-white text-[#111] hover:bg-[#fafafa] focus-visible:ring-[#111]",
  pill: "rounded-full border border-[#e5e5e5] bg-white text-[#111] hover:border-[#111] focus-visible:ring-[#111]",
  icon: "border border-transparent bg-transparent text-[#666] hover:bg-[#fafafa] hover:text-[#111] focus-visible:ring-[#111]",
};

export const yeonButtonWebSizes: Record<YeonButtonSize, string> = {
  sm: "px-3 py-1.5 text-[12px]",
  md: "px-4 py-2 text-[13px]",
  lg: "px-5 py-3 text-[14px]",
  xl: "px-8 py-4 text-[17px]",
  icon: "h-10 w-10 p-0",
};

export function getYeonButtonClassName({
  variant = "secondary",
  size = "md",
  className,
}: {
  variant?: YeonButtonVariant;
  size?: YeonButtonSize;
  className?: string;
} = {}) {
  return joinClassNames(
    "inline-flex items-center justify-center rounded-xl font-semibold no-underline transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    yeonButtonWebVariants[variant],
    yeonButtonWebSizes[size],
    className
  );
}

export function getYeonButtonNativeStyle({
  variant = "secondary",
  size = "md",
  disabled = false,
}: {
  variant?: YeonButtonVariant;
  size?: YeonButtonSize;
  disabled?: boolean;
}) {
  const base = {
    alignItems: "center" as const,
    borderRadius: variant === "pill" ? yeonRadius.full : yeonRadius.lg,
    borderWidth: 1,
    flexDirection: "row" as const,
    justifyContent: "center" as const,
    opacity: disabled ? 0.5 : 1,
  };

  const sizeStyle = {
    sm: {
      minHeight: 32,
      paddingHorizontal: yeonSpacing[3],
      paddingVertical: 6,
    },
    md: {
      minHeight: 40,
      paddingHorizontal: yeonSpacing[4],
      paddingVertical: yeonSpacing[2],
    },
    lg: {
      minHeight: 48,
      paddingHorizontal: yeonSpacing[5],
      paddingVertical: yeonSpacing[3],
    },
    xl: {
      minHeight: 56,
      paddingHorizontal: yeonSpacing[8],
      paddingVertical: yeonSpacing[4],
    },
    icon: { height: 40, paddingHorizontal: 0, paddingVertical: 0, width: 40 },
  }[size];

  const variantStyle = {
    primary: {
      backgroundColor: yeonColors.mobile.accent,
      borderColor: yeonColors.mobile.accent,
      color: yeonColors.white,
    },
    secondary: {
      backgroundColor: yeonColors.white,
      borderColor: yeonColors.neutral[100],
      color: yeonColors.black,
    },
    ghost: {
      backgroundColor: "transparent",
      borderColor: "transparent",
      color: yeonColors.neutral[600],
    },
    danger: {
      backgroundColor: yeonColors.white,
      borderColor: yeonColors.mobile.border,
      color: yeonColors.mobile.error,
    },
    pill: {
      backgroundColor: yeonColors.white,
      borderColor: yeonColors.neutral[100],
      color: yeonColors.black,
    },
    icon: {
      backgroundColor: "transparent",
      borderColor: "transparent",
      color: yeonColors.neutral[600],
    },
  }[variant];

  return {
    container: {
      ...base,
      ...sizeStyle,
      backgroundColor: variantStyle.backgroundColor,
      borderColor: variantStyle.borderColor,
    },
    text: {
      color: variantStyle.color,
      fontSize:
        size === "xl" ? yeonTypography.fontSize.lg : yeonTypography.fontSize.sm,
      fontWeight: yeonTypography.fontWeight.semibold,
    },
  };
}
