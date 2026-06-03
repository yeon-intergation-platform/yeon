import type { ReactNode } from "react";

import { YeonText } from "../../primitives/YeonText/index.native";
import {
  YeonView,
  type YeonViewProps,
} from "../../primitives/YeonView/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";
import { yeonMobileAppColors } from "../../theme";

export type YeonFormIntroProps = {
  hint?: ReactNode;
  style?: YeonViewProps["style"];
  title: ReactNode;
};

export function YeonFormIntro({ hint, style, title }: YeonFormIntroProps) {
  return (
    <YeonView style={[styles.container, style]}>
      <YeonText variant="unstyled" tone="inherit" style={styles.title}>
        {title}
      </YeonText>
      {hint ? (
        <YeonText variant="unstyled" tone="inherit" style={styles.hint}>
          {hint}
        </YeonText>
      ) : null}
    </YeonView>
  );
}

const styles = createYeonStyleSheet({
  container: {
    gap: 4,
    marginBottom: 12,
  },
  hint: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
  },
  title: {
    color: yeonMobileAppColors.text,
    fontSize: 18,
    fontWeight: "900",
  },
});
