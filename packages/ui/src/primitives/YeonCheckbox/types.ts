import type { InputHTMLAttributes } from "react";

export type YeonCheckboxWebProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
>;
