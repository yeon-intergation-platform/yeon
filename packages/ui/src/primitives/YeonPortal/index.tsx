import type { ReactNode } from "react";
import { createPortal } from "react-dom";

export type YeonPortalProps = {
  children?: ReactNode;
};

interface YeonPortalContainerPort {
  getPortalContainer(): HTMLElement | null;
}

const YEON_PORTAL_CONTAINER_PORT: YeonPortalContainerPort = {
  getPortalContainer() {
    return globalThis.document?.body ?? null;
  },
};

export function YeonPortal({ children }: YeonPortalProps) {
  const portalContainer = YEON_PORTAL_CONTAINER_PORT.getPortalContainer();

  if (!portalContainer) {
    return null;
  }

  return createPortal(children, portalContainer);
}
