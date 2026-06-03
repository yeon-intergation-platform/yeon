import { getYeonBadgeClassName } from "./variants";
import type { YeonBadgeWebProps } from "./types";

export type {
  YeonBadgeVariant,
  YeonBadgeWebProps as YeonBadgeProps,
} from "./types";
export { getYeonBadgeClassName, yeonBadgeWebVariants } from "./variants";

export function YeonBadge({
  variant = "neutral",
  className,
  ...props
}: YeonBadgeWebProps) {
  return (
    <span
      className={getYeonBadgeClassName({ variant, className })}
      {...props}
    />
  );
}
