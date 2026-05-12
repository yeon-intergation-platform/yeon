import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

import { joinClassNames } from "./class-names";

export const YEON_BUTTON_VARIANTS = {
  primary:
    "border border-[#111] bg-[#111] text-white hover:opacity-90 focus-visible:ring-[#111]",
  secondary:
    "border border-[#e5e5e5] bg-white text-[#111] hover:border-[#111] focus-visible:ring-[#111]",
  ghost:
    "border border-transparent bg-transparent text-[#666] hover:text-[#111] focus-visible:ring-[#111]",
  danger:
    "border border-red-200 bg-white text-red-600 hover:bg-red-50 focus-visible:ring-red-600",
  pill: "rounded-full border border-[#e5e5e5] bg-white text-[#111] hover:border-[#111] focus-visible:ring-[#111]",
  icon: "border border-transparent bg-transparent text-[#666] hover:bg-[#fafafa] hover:text-[#111] focus-visible:ring-[#111]",
} as const;

export const YEON_BUTTON_SIZES = {
  sm: "px-3 py-1.5 text-[12px]",
  md: "px-4 py-2 text-[13px]",
  lg: "px-5 py-3 text-[14px]",
  xl: "px-8 py-4 text-[17px]",
  icon: "h-10 w-10 p-0",
} as const;

type YeonButtonBaseProps = {
  variant?: keyof typeof YEON_BUTTON_VARIANTS;
  size?: keyof typeof YEON_BUTTON_SIZES;
  className?: string;
};

export type YeonButtonProps =
  | (YeonButtonBaseProps & {
      as?: "button";
    } & ButtonHTMLAttributes<HTMLButtonElement>)
  | (YeonButtonBaseProps & {
      as: "a";
    } & AnchorHTMLAttributes<HTMLAnchorElement>);

export function getYeonButtonClassName({
  variant = "secondary",
  size = "md",
  className,
}: YeonButtonBaseProps = {}) {
  return joinClassNames(
    "inline-flex items-center justify-center rounded-xl font-semibold no-underline transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    YEON_BUTTON_VARIANTS[variant],
    YEON_BUTTON_SIZES[size],
    className
  );
}

export function YeonButton(props: YeonButtonProps) {
  if (props.as === "a") {
    const { variant, size, className, as: _as, ...anchorProps } = props;
    return (
      <a
        className={getYeonButtonClassName({ variant, size, className })}
        {...anchorProps}
      />
    );
  }

  const { variant, size, className, as: _as, ...buttonProps } = props;
  return (
    <button
      className={getYeonButtonClassName({ variant, size, className })}
      {...buttonProps}
    />
  );
}
