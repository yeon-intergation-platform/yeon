import { forwardRef } from "react";

import type { YeonCheckboxWebProps } from "./types";
import { getYeonCheckboxClassName } from "./variants";

export type { YeonCheckboxWebProps as YeonCheckboxProps } from "./types";
export { getYeonCheckboxClassName, YEON_CHECKBOX_CLASS } from "./variants";

export const YeonCheckbox = forwardRef<HTMLInputElement, YeonCheckboxWebProps>(
  function YeonCheckbox({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        type="checkbox"
        className={getYeonCheckboxClassName(className)}
        {...props}
      />
    );
  }
);
