import type { ElementType, HTMLAttributes } from "react";

export type YeonSurfaceVariant =
  | "plain"
  | "card"
  | "panel"
  | "empty"
  | "loading"
  | "subtle"
  | "outlined";

export type YeonSurfaceWebProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  variant?: YeonSurfaceVariant;
};
