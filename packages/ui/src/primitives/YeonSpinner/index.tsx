import type { HTMLAttributes } from "react";

export type YeonSpinnerProps = HTMLAttributes<HTMLSpanElement>;

export function YeonSpinner(props: YeonSpinnerProps) {
  return <span aria-hidden="true" {...props} />;
}
