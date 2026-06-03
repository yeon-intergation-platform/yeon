import type { ReactNode } from "react";

import {
  YeonSurface,
  type YeonSurfaceProps,
} from "../../primitives/YeonSurface/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";
import { yeonMobileAppColors, yeonMobileAppShadow } from "../../theme";

export type YeonSectionCardProps = {
  children: ReactNode;
  style?: YeonSurfaceProps["style"];
};

export function YeonSectionCard({ children, style }: YeonSectionCardProps) {
  return <YeonSurface style={[styles.card, style]}>{children}</YeonSurface>;
}

const styles = createYeonStyleSheet({
  card: {
    ...yeonMobileAppShadow,
    backgroundColor: yeonMobileAppColors.surfaceStrong,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 24,
    padding: 16,
  },
});
