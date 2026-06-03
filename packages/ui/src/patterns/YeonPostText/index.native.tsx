import type { ReactNode } from "react";

import { YeonText } from "../../primitives/YeonText/index.native";
import type { YeonTextProps } from "../../primitives/YeonText/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";
import { yeonMobileAppColors } from "../../theme";

export type YeonPostTextVariant = "body" | "hint" | "meta";

export type YeonPostTextProps = {
  children: ReactNode;
  style?: YeonTextProps["style"];
  variant?: YeonPostTextVariant;
};

export function YeonPostText({
  children,
  style,
  variant = "body",
}: YeonPostTextProps) {
  return (
    <YeonText
      variant="unstyled"
      tone="inherit"
      style={[
        styles.base,
        variant === "hint" ? styles.hint : null,
        variant === "meta" ? styles.meta : null,
        style,
      ]}
    >
      {children}
    </YeonText>
  );
}

const styles = createYeonStyleSheet({
  base: {
    color: yeonMobileAppColors.text,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 30,
  },
  hint: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
    marginTop: 12,
  },
  meta: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 18,
  },
});
