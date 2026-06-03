import type { CSSProperties } from "react";

import { YeonButton } from "../../primitives/YeonButton";
import { YeonView } from "../../primitives/YeonView";
import { joinClassNames } from "../../utils";

export type YeonSegmentedControlOption<TValue extends string = string> = {
  disabled?: boolean;
  label: string;
  value: TValue;
};

export type YeonSegmentedControlProps<TValue extends string = string> = {
  className?: string;
  onValueChange: (value: TValue) => void;
  options: YeonSegmentedControlOption<TValue>[];
  style?: CSSProperties;
  value: TValue;
};

export function YeonSegmentedControl<TValue extends string = string>({
  className,
  onValueChange,
  options,
  style,
  value,
}: YeonSegmentedControlProps<TValue>) {
  return (
    <YeonView
      className={joinClassNames("flex flex-row gap-2.5", className)}
      style={style}
    >
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <YeonButton
            aria-label={option.label}
            disabled={option.disabled}
            key={option.value}
            onClick={() => onValueChange(option.value)}
            variant={selected ? "primary" : "secondary"}
            className={joinClassNames(
              "min-h-11 flex-1 rounded-xl border px-4 py-3 text-[14px] font-black",
              selected
                ? "border-[#111] bg-[#111] text-white"
                : "border-[#e5e5e5] bg-white text-[#111]",
              option.disabled ? "opacity-45" : undefined
            )}
          >
            {option.label}
          </YeonButton>
        );
      })}
    </YeonView>
  );
}
