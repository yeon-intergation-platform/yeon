import {
  yeonColors,
  yeonRadius,
  yeonSpacing,
  yeonTypography,
} from "@yeon/design-tokens";

import { joinClassNames } from "../../utils";

export const YEON_FIELD_BASE_CLASS =
  "w-full rounded-xl border border-[#e5e5e5] bg-white px-3 py-2 text-[14px] text-[#111] outline-none transition-colors placeholder:text-[#aaa] focus:border-[#111] disabled:bg-[#fafafa] disabled:text-[#aaa]";

export function getYeonFieldClassName(className?: string) {
  return joinClassNames(YEON_FIELD_BASE_CLASS, className);
}

export function getYeonFieldNativeStyle() {
  return {
    backgroundColor: yeonColors.white,
    borderColor: yeonColors.neutral[100],
    borderRadius: yeonRadius.md,
    borderWidth: 1,
    color: yeonColors.black,
    fontSize: yeonTypography.fontSize.sm,
    minHeight: 42,
    paddingHorizontal: yeonSpacing[3],
    paddingVertical: yeonSpacing[2],
  };
}
