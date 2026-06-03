import type { ReactNode } from "react";

import {
  YeonText,
  type YeonTextProps,
} from "../../primitives/YeonText/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";
import { yeonMobileAppColors } from "../../theme";

export type YeonSectionTitleSpacing = "md" | "none" | "sm";

export type YeonSectionTitleProps = {
  children: ReactNode;
  spacing?: YeonSectionTitleSpacing;
  style?: YeonTextProps["style"];
};

export function YeonSectionTitle({
  children,
  spacing = "md",
  style,
}: YeonSectionTitleProps) {
  return (
    <YeonText
      variant="unstyled"
      tone="inherit"
      style={[styles.title, spacingStyles[spacing], style]}
    >
      {children}
    </YeonText>
  );
}

const styles = createYeonStyleSheet({
  title: {
    color: yeonMobileAppColors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  mdSpacing: {
    marginBottom: 14,
  },
  noSpacing: {
    marginBottom: 0,
  },
  smSpacing: {
    marginBottom: 12,
  },
});

const spacingStyles = {
  md: styles.mdSpacing,
  none: styles.noSpacing,
  sm: styles.smSpacing,
} as const;
