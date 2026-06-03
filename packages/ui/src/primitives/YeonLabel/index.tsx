import type { LabelHTMLAttributes } from "react";

import { joinClassNames } from "../../utils";

export type YeonLabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export function YeonLabel({ className, ...props }: YeonLabelProps) {
  return <label className={joinClassNames(className)} {...props} />;
}
