import { getYeonSurfaceClassName } from "./variants";
import type { YeonSurfaceWebProps } from "./types";

export type {
  YeonSurfaceVariant,
  YeonSurfaceWebProps as YeonSurfaceProps,
} from "./types";
export { getYeonSurfaceClassName, yeonSurfaceWebVariants } from "./variants";

export function YeonSurface({
  as: Component = "div",
  variant = "card",
  className,
  ...props
}: YeonSurfaceWebProps) {
  return (
    <Component
      className={getYeonSurfaceClassName({ variant, className })}
      {...props}
    />
  );
}
