import type { ElementType } from "react";

import { getYeonTextClassName } from "./variants";
import type { YeonTextWebProps } from "./types";

export type {
  YeonTextTone,
  YeonTextVariant,
  YeonTextWebProps as YeonTextProps,
} from "./types";
export {
  getYeonTextClassName,
  yeonTextWebTones,
  yeonTextWebVariants,
} from "./variants";

export function YeonText({
  as: Tag = "p",
  variant = "body",
  tone = "primary",
  className,
  ...props
}: YeonTextWebProps) {
  const Component = Tag as ElementType;

  return (
    <Component
      className={getYeonTextClassName({ variant, tone, className })}
      {...props}
    />
  );
}
