import type { ReactNode } from "react";

import { YeonText } from "../../primitives/YeonText/index.native";
import {
  YeonView,
  type YeonViewProps,
} from "../../primitives/YeonView/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";
import { yeonMobileAppColors } from "../../theme";

export type YeonAuthHeaderProps = {
  brand: ReactNode;
  style?: YeonViewProps["style"];
  title: ReactNode;
};

export function YeonAuthHeader({ brand, style, title }: YeonAuthHeaderProps) {
  return (
    <YeonView style={[styles.header, style]}>
      <YeonText variant="unstyled" tone="inherit" style={styles.brand}>
        {brand}
      </YeonText>
      <YeonText variant="unstyled" tone="inherit" style={styles.title}>
        {title}
      </YeonText>
    </YeonView>
  );
}

const styles = createYeonStyleSheet({
  brand: {
    color: yeonMobileAppColors.text,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  header: {
    alignItems: "center",
    gap: 10,
  },
  title: {
    color: yeonMobileAppColors.text,
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: -0.8,
    textAlign: "center",
  },
});
