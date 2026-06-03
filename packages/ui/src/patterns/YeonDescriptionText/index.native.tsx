import type { ReactNode } from "react";

import {
  YeonText,
  type YeonTextProps,
} from "../../primitives/YeonText/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";
import { yeonMobileAppColors } from "../../theme";

export type YeonDescriptionTextLine = "default" | "roomy";

export type YeonDescriptionTextProps = {
  children: ReactNode;
  line?: YeonDescriptionTextLine;
  style?: YeonTextProps["style"];
};

export function YeonDescriptionText({
  children,
  line = "default",
  style,
}: YeonDescriptionTextProps) {
  return (
    <YeonText
      variant="unstyled"
      tone="inherit"
      style={[styles.text, lineStyles[line], style]}
    >
      {children}
    </YeonText>
  );
}

const styles = createYeonStyleSheet({
  text: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 14,
  },
  defaultLine: {
    lineHeight: 20,
  },
  roomyLine: {
    lineHeight: 22,
  },
});

const lineStyles = {
  default: styles.defaultLine,
  roomy: styles.roomyLine,
} as const;
