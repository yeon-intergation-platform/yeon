import type { ReactNode } from "react";

import {
  YeonView,
  type YeonViewProps,
} from "../../primitives/YeonView/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";
import { yeonMobileAppColors } from "../../theme";

export type YeonFormBlockProps = {
  children: ReactNode;
  style?: YeonViewProps["style"];
};

export function YeonFormBlock({ children, style }: YeonFormBlockProps) {
  return <YeonView style={[styles.block, style]}>{children}</YeonView>;
}

const styles = createYeonStyleSheet({
  block: {
    backgroundColor: yeonMobileAppColors.surfaceStrong,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 22,
    borderWidth: 1,
    gap: 14,
    padding: 18,
  },
});
