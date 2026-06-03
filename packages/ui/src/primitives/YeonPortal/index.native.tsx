import type { ReactNode } from "react";

export type YeonPortalProps = {
  children?: ReactNode;
};

export function YeonPortal({ children }: YeonPortalProps) {
  return children;
}
