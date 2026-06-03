import type { FormHTMLAttributes } from "react";

import { joinClassNames } from "../../utils";

export type YeonFormProps = FormHTMLAttributes<HTMLFormElement>;

export function YeonForm({ className, ...props }: YeonFormProps) {
  return <form className={joinClassNames(className)} {...props} />;
}
