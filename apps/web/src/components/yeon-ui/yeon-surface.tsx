import type { ElementType, HTMLAttributes } from "react";

import { joinClassNames } from "./class-names";

export const YEON_SURFACE_VARIANTS = {
  card: "rounded-2xl border border-[#e5e5e5] bg-white",
  panel: "rounded-2xl border border-[#e5e5e5] bg-[#fafafa]",
  empty:
    "rounded-2xl border border-dashed border-[#e5e5e5] bg-white text-center",
  loading: "rounded-2xl border border-[#e5e5e5] bg-white text-[#666]",
} as const;

export type YeonSurfaceProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  variant?: keyof typeof YEON_SURFACE_VARIANTS;
};

export function getYeonSurfaceClassName({
  variant = "card",
  className,
}: Pick<YeonSurfaceProps, "variant" | "className"> = {}) {
  return joinClassNames(YEON_SURFACE_VARIANTS[variant], className);
}

export function YeonSurface({
  as: Component = "div",
  variant = "card",
  className,
  ...props
}: YeonSurfaceProps) {
  return (
    <Component
      className={getYeonSurfaceClassName({ variant, className })}
      {...props}
    />
  );
}
