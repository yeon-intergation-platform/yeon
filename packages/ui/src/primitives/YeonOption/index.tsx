import type { OptionHTMLAttributes } from "react";

export type YeonOptionProps = OptionHTMLAttributes<HTMLOptionElement>;

export function YeonOption(props: YeonOptionProps) {
  return <option {...props} />;
}
