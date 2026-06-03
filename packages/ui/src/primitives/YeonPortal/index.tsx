import type { ReactNode } from "react";
import { createPortal } from "react-dom";

export type YeonPortalProps = {
  children?: ReactNode;
};

export function YeonPortal({ children }: YeonPortalProps) {
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(children, document.body);
}
