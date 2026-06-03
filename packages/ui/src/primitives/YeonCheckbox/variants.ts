import { yeonColors, yeonRadius, yeonSpacing } from "@yeon/design-tokens";

import { joinClassNames } from "../../utils";

export const YEON_CHECKBOX_CLASS =
  "h-4 w-4 rounded border-[#e5e5e5] accent-[#111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111]";

export function getYeonCheckboxClassName(className?: string) {
  return joinClassNames(YEON_CHECKBOX_CLASS, className);
}

export function getYeonCheckboxNativeStyle(checked = false) {
  return {
    alignItems: "center" as const,
    backgroundColor: checked ? yeonColors.mobile.accent : yeonColors.white,
    borderColor: checked ? yeonColors.mobile.accent : yeonColors.neutral[100],
    borderRadius: yeonRadius.sm,
    borderWidth: 1,
    height: yeonSpacing[4],
    justifyContent: "center" as const,
    width: yeonSpacing[4],
  };
}
