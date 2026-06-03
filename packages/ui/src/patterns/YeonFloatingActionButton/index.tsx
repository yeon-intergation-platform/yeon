import type { CSSProperties, ReactNode } from "react";

import { YeonButton } from "../../primitives/YeonButton";
import { joinClassNames } from "../../utils";

export type YeonFloatingActionButtonProps = {
  accessibilityLabel: string;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  label?: string;
  labelStyle?: CSSProperties;
  onPress: () => void;
  style?: CSSProperties;
};

export function YeonFloatingActionButton({
  accessibilityLabel,
  children,
  className,
  disabled = false,
  label = "+",
  labelStyle,
  onPress,
  style,
}: YeonFloatingActionButtonProps) {
  return (
    <YeonButton
      aria-label={accessibilityLabel}
      disabled={disabled}
      onClick={onPress}
      size="icon"
      variant="primary"
      className={joinClassNames(
        "fixed bottom-7 right-6 h-16 w-16 rounded-[32px] bg-[#111] text-[38px] font-light leading-[42px] text-white",
        className
      )}
      style={style}
    >
      {children ?? <span style={labelStyle}>{label}</span>}
    </YeonButton>
  );
}
