import type { HTMLAttributes } from "react";

export type YeonBadgeVariant =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "accent";

export type YeonBadgeWebProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: YeonBadgeVariant;
};
