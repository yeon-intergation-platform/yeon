import type { ReactNode } from "react";

import {
  YeonView,
  type YeonViewProps,
} from "../../primitives/YeonView/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";

export type YeonFormStackGap = "compact" | "default" | "roomy";

export type YeonFormStackProps = {
  children: ReactNode;
  fill?: boolean;
  gap?: YeonFormStackGap;
  style?: YeonViewProps["style"];
};

export function YeonFormStack({
  children,
  fill = false,
  gap = "default",
  style,
}: YeonFormStackProps) {
  return (
    <YeonView style={[fill ? styles.fill : null, gapStyles[gap], style]}>
      {children}
    </YeonView>
  );
}

const styles = createYeonStyleSheet({
  fill: {
    flex: 1,
  },
  compact: {
    gap: 10,
  },
  default: {
    gap: 12,
  },
  roomy: {
    gap: 16,
  },
});

const gapStyles = {
  compact: styles.compact,
  default: styles.default,
  roomy: styles.roomy,
} as const;
