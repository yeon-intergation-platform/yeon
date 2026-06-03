import { yeonColors, yeonRadius } from "@yeon/design-tokens";

import { joinClassNames } from "../../utils";

export const YEON_SWITCH_TRACK_CLASS =
  "inline-flex h-7 w-12 items-center rounded-full border border-[#e5e5e5] bg-[#fafafa] p-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export const YEON_SWITCH_THUMB_CLASS =
  "block h-5 w-5 rounded-full bg-white shadow-sm transition-transform";

export function getYeonSwitchClassName({
  checked = false,
  className,
}: {
  checked?: boolean;
  className?: string;
} = {}) {
  return joinClassNames(
    YEON_SWITCH_TRACK_CLASS,
    checked ? "border-[#111] bg-[#111]" : null,
    className
  );
}

export function getYeonSwitchThumbClassName({
  checked = false,
  className,
}: {
  checked?: boolean;
  className?: string;
} = {}) {
  return joinClassNames(
    YEON_SWITCH_THUMB_CLASS,
    checked ? "translate-x-5" : "translate-x-0",
    className
  );
}

export function getYeonSwitchNativeStyle({
  checked = false,
  disabled = false,
}: {
  checked?: boolean;
  disabled?: boolean;
} = {}) {
  return {
    thumb: {
      backgroundColor: yeonColors.white,
      borderRadius: yeonRadius.full,
      height: 20,
      transform: [{ translateX: checked ? 20 : 0 }],
      width: 20,
    },
    track: {
      alignItems: "center" as const,
      backgroundColor: checked
        ? yeonColors.mobile.accent
        : yeonColors.neutral[50],
      borderColor: checked
        ? yeonColors.mobile.accent
        : yeonColors.mobile.border,
      borderRadius: yeonRadius.full,
      borderWidth: 1,
      height: 28,
      justifyContent: "center" as const,
      opacity: disabled ? 0.5 : 1,
      paddingHorizontal: 3,
      width: 48,
    },
  };
}
