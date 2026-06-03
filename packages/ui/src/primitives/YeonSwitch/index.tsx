import { forwardRef, type MouseEvent } from "react";

import type { YeonSwitchWebProps } from "./types";
import {
  getYeonSwitchClassName,
  getYeonSwitchThumbClassName,
} from "./variants";

export type { YeonSwitchWebProps as YeonSwitchProps } from "./types";
export {
  getYeonSwitchClassName,
  getYeonSwitchThumbClassName,
  YEON_SWITCH_THUMB_CLASS,
  YEON_SWITCH_TRACK_CLASS,
} from "./variants";

export const YeonSwitch = forwardRef<HTMLButtonElement, YeonSwitchWebProps>(
  function YeonSwitch(
    {
      checked = false,
      className,
      disabled,
      onCheckedChange,
      onClick,
      thumbClassName,
      ...props
    },
    ref
  ) {
    function handleClick(event: MouseEvent<HTMLButtonElement>) {
      onClick?.(event);

      if (event.defaultPrevented || disabled) {
        return;
      }

      onCheckedChange?.(!checked);
    }

    return (
      <button
        ref={ref}
        aria-checked={checked}
        className={getYeonSwitchClassName({ checked, className })}
        disabled={disabled}
        onClick={handleClick}
        role="switch"
        type="button"
        {...props}
      >
        <span
          aria-hidden="true"
          className={getYeonSwitchThumbClassName({
            checked,
            className: thumbClassName,
          })}
        />
      </button>
    );
  }
);
