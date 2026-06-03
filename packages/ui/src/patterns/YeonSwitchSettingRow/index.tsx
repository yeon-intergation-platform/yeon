import type { ReactNode } from "react";

import { YeonSwitch, type YeonSwitchProps } from "../../primitives/YeonSwitch";
import { YeonText } from "../../primitives/YeonText";
import { YeonView } from "../../primitives/YeonView";
import { joinClassNames } from "../../utils";

export type YeonSwitchSettingRowProps = {
  accessibilityLabel?: string;
  checked: boolean;
  className?: string;
  disabled?: boolean;
  hint?: ReactNode;
  label: ReactNode;
  onCheckedChange: NonNullable<YeonSwitchProps["onCheckedChange"]>;
};

export function YeonSwitchSettingRow({
  accessibilityLabel,
  checked,
  className,
  disabled,
  hint,
  label,
  onCheckedChange,
}: YeonSwitchSettingRowProps) {
  return (
    <YeonView
      className={joinClassNames(
        "flex items-center justify-between gap-4",
        className
      )}
    >
      <YeonView className="grid flex-1 gap-1">
        <YeonText
          variant="unstyled"
          tone="inherit"
          className="text-[16px] font-extrabold text-[#111]"
        >
          {label}
        </YeonText>
        {hint ? (
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="text-[12px] leading-5 text-[#666]"
          >
            {hint}
          </YeonText>
        ) : null}
      </YeonView>
      <YeonSwitch
        aria-label={accessibilityLabel}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
    </YeonView>
  );
}
