import type { CSSProperties, ReactNode } from "react";

import { YeonButton } from "../../primitives/YeonButton";
import { joinClassNames } from "../../utils";

export type YeonActionButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "dark";

export type YeonActionButtonProps = {
  disabled?: boolean;
  label: string;
  labelStyle?: CSSProperties;
  leftSlot?: ReactNode;
  onPress: () => void;
  style?: CSSProperties;
  variant?: YeonActionButtonVariant;
};

const variantClassNames: Record<YeonActionButtonVariant, string> = {
  primary: "border-[#111] bg-[#111] text-white",
  secondary: "border-[#e5e5e5] bg-white text-[#111]",
  danger: "border-[#e5e5e5] bg-white text-[#111]",
  dark: "border-[#111] bg-[#111] text-white",
};

export function YeonActionButton({
  disabled = false,
  label,
  labelStyle,
  leftSlot,
  onPress,
  style,
  variant = "primary",
}: YeonActionButtonProps) {
  return (
    <YeonButton
      aria-label={label}
      disabled={disabled}
      onClick={onPress}
      size="lg"
      style={style}
      variant={variant === "dark" ? "primary" : variant}
      className={joinClassNames(
        "min-h-12 gap-2 rounded-[18px] px-4 text-[15px] font-extrabold",
        variantClassNames[variant]
      )}
    >
      {leftSlot ? <span aria-hidden="true">{leftSlot}</span> : null}
      <span style={labelStyle}>{label}</span>
    </YeonButton>
  );
}
