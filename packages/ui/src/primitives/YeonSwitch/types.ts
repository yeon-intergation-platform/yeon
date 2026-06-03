import type { ButtonHTMLAttributes } from "react";

export type YeonSwitchWebProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-checked" | "onChange" | "role" | "type"
> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  thumbClassName?: string;
};
