import type { CSSProperties, ReactNode } from "react";

import { YeonSurface } from "../../primitives/YeonSurface";

export type YeonSectionCardProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function YeonSectionCard({
  children,
  className,
  style,
}: YeonSectionCardProps) {
  return (
    <YeonSurface variant="card" className={className} style={style}>
      {children}
    </YeonSurface>
  );
}
