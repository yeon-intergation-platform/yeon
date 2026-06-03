import { yeonColors, yeonTypography } from "@yeon/design-tokens";

import type { YeonTextTone, YeonTextVariant } from "./types";
import { joinClassNames } from "../../utils";

export const yeonTextWebVariants: Record<YeonTextVariant, string> = {
  title: "text-[32px] font-black leading-tight tracking-[-0.05em]",
  subtitle: "text-[20px] font-black leading-snug tracking-[-0.03em]",
  body: "text-[15px] leading-7",
  caption: "text-[12px] leading-5",
  label: "text-[13px] font-bold leading-5",
  unstyled: "",
};

export const yeonTextWebTones: Record<YeonTextTone, string> = {
  primary: "text-[#111]",
  secondary: "text-[#666]",
  muted: "text-[#aaa]",
  inverse: "text-white",
  danger: "text-[#111]",
  inherit: "",
};

export function getYeonTextClassName({
  variant = "body",
  tone = "primary",
  className,
}: {
  variant?: YeonTextVariant;
  tone?: YeonTextTone;
  className?: string;
} = {}) {
  return joinClassNames(
    yeonTextWebVariants[variant],
    yeonTextWebTones[tone],
    className
  );
}

export function getYeonTextNativeStyle({
  variant = "body",
  tone = "primary",
}: {
  variant?: YeonTextVariant;
  tone?: YeonTextTone;
} = {}) {
  const variantStyle = {
    title: {
      fontSize: yeonTypography.fontSize["3xl"],
      fontWeight: yeonTypography.fontWeight.black,
      lineHeight: 38,
    },
    subtitle: {
      fontSize: yeonTypography.fontSize.xl,
      fontWeight: yeonTypography.fontWeight.black,
      lineHeight: 28,
    },
    body: {
      fontSize: yeonTypography.fontSize.base,
      fontWeight: yeonTypography.fontWeight.medium,
      lineHeight: 24,
    },
    caption: {
      fontSize: yeonTypography.fontSize.xs,
      fontWeight: yeonTypography.fontWeight.medium,
      lineHeight: 18,
    },
    label: {
      fontSize: yeonTypography.fontSize.sm,
      fontWeight: yeonTypography.fontWeight.bold,
      lineHeight: 20,
    },
    unstyled: {},
  }[variant];

  const color = {
    primary: yeonColors.black,
    secondary: yeonColors.neutral[600],
    muted: yeonColors.neutral[400],
    inverse: yeonColors.white,
    danger: yeonColors.mobile.error,
    inherit: undefined,
  }[tone];

  return color ? { ...variantStyle, color } : variantStyle;
}
